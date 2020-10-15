const { User, ResetToken } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");
var SHA256 = require("crypto-js/sha256");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const moment = require("moment");
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "actorcloud",
  host: "rainflow.live",
  database: "actorcloud",
  password: "public",
  port: 5432,
});

const transport = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false,
  auth: {
    user: "no-reply",
    pass: "dlsurainflow1234",
  },
});

// const transport = nodemailer.createTransport({
//   host: "smtp.rainflow.live",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "ivan_garan@dlsu.edu.ph",
//     pass: "I3G5wdFpqL7D4ScE",
//   },
// });

exports.create = (req, res) => {};

exports.forgotPassword = async (req, res) => {
  var email = await User.findOne({ where: { email: req.body.email } });
  if (email === null) {
    return res.json({ status: "Success" });
  }

  await ResetToken.update(
    {
      used: 1,
    },
    {
      where: {
        email: req.body.email,
      },
    }
  );

  //Create a random reset token
  var fpSalt = crypto.randomBytes(64).toString("base64");

  //token expires after one hour
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1 / 24);

  console.log("Expire Date: " + expireDate);
  // const token = jwt.sign({ email: req.body.email }, fpSalt, {
  //   expiresIn: "1h",
  // });

  //insert token data into DB
  await ResetToken.create({
    email: req.body.email,
    expiration: expireDate,
    token: fpSalt,
    used: 0,
  });

  //create email
  const message = {
    from: "no-reply@rainflow.live",
    to: req.body.email,
    // replyTo: process.env.REPLYTO_ADDRESS,
    subject: "RainFLOW Network: Forgot Password",
    text:
      "To reset your password, please click the link below.\n\nhttps://rainflow.live/reset-password" +
      "\n\n Enter your email address and the token below.\n" +
      "Token: " +
      fpSalt,
  };

  //send email
  transport.sendMail(message, function (err, info) {
    if (err) {
      console.error(err);
    } else {
      console.log(info);
    }
  });

  return res.json({ status: "Success" });
};

exports.resetPassword = async (req, res) => {
  var currentDate = new Date();
  await ResetToken.destroy({
    where: {
      createdAt: { $lt: Sequelize.fn(currentDate) },
    },
  });

  var record = await ResetToken.findOne({
    where: {
      email: req.body.email,
      // createdAt: { $gt: moment().toDate() },
      token: req.body.token,
      used: 0,
    },
  });

  if (record === null) {
    return res.json({
      status: "Error",
      message: "Token not found. Please try the reset password process again.",
    });
  }

  var upd = await ResetToken.update(
    {
      used: 1,
    },
    {
      where: {
        email: req.body.email,
      },
    }
  );

  var new_password = SHA256(req.body.password).toString();
  bcrypt.hash(new_password, saltRounds, async function (err, hash) {
    if (err) {
      res.json({
        status: "Error",
        message: "Please try again.",
      });
      console.error(err);
    } else {
      await User.update(
        {
          password: hash,
        },
        {
          where: {
            email: req.body.email,
          },
        }
      );
      pool.query(
        "UPDATE users SET password = $1 WHERE email = $2",
        [hash, req.body.email],
        (error, results) => {
          if (error) {
            console.error(error);
          }
        }
      );
      return res.json({
        status: "Success",
        message: "Password reset. Please login with your new password.",
      });
    }
  });
};

exports.changePassword = async (req, res) => {
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  jwt.verify(tokenArray[1], config.secret, async function (err, decoded) {
    if (err) {
      res.status(400).send({
        status: "Error",
        message: err.message,
      });
    } else {
      var user = await User.findOne({ where: { id: decoded.id } });

      if (user === null) {
        return res.json({
          status: "Error",
          message: "User not found.",
        });
      }
      if (
        bcrypt.compareSync(SHA256(req.body.password).toString(), user.password)
      ) {
        var new_password = SHA256(req.body.new_password).toString();
        bcrypt.hash(new_password, saltRounds, async function (err, hash) {
          if (err) {
            res.json({
              status: "Error",
              message: "Please try again.",
            });
            console.error(err);
          } else {
            await User.update(
              {
                password: hash,
              },
              {
                where: {
                  id: decoded.id,
                },
              }
            );
            pool.query(
              "UPDATE users SET password = $1 WHERE email = $2",
              [hash, user.email],
              (error, results) => {
                if (error) {
                  console.error(error);
                }
              }
            );

            return res.json({
              status: "Success",
              message:
                "Password is changed. Please login with your new password.",
            });
          }
        });
      } else {
        return res.json({
          status: "Error",
          message: "Current password is incorrect.",
        });
      }
    }
  });
};

exports.authenticate = async (req, res) => {
  try {
    await User.findOne({ where: { username: req.body.username } }).then(
      (user) => {
        if (!user) {
          res.status(400).send({
            status: "Error",
            message: "Cannot login with provided credentials",
          });
        }

        if (
          bcrypt.compareSync(
            SHA256(req.body.password).toString(),
            user.password
          )
        ) {
          const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: "3d",
          });
          res.json({
            status: "Success",
            data: {
              userID: user.id,
              username: user.username,
              email: user.email,
              tenantID: user.tenantID,
              points: user.points,
              token: token,
            },
          });
        } else {
          res.status(400).send({
            status: "Error",
            message: "Cannot login with provided credentials",
          });
        }
      }
    );
    console.log("User: " + user);
  } catch (err) {
    console.log("Error: " + err);
  }
};
