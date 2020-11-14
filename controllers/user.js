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
  tls: {
    rejectUnauthorized: false,
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
  console.log(req.body.email);
  var email = await User.findOne({
    where: { email: { [Op.iLike]: req.body.email } },
  });

  if (email === null) {
    return res.json({ status: "Success" });
  }

  await ResetToken.update(
    {
      used: 1,
    },
    {
      where: {
        email: email.email,
      },
    }
  );

  await ResetToken.destroy({
    where: {
      used: 1,
    },
  });

  //Create a random reset token
  var fpSalt = crypto.randomBytes(64).toString("base64");

  //token expires after one hour
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1 / 24);

  // console.log("Expire Date: " + expireDate);
  // const token = jwt.sign({ email: req.body.email }, fpSalt, {
  //   expiresIn: "1h",
  // });

  //insert token data into DB
  await ResetToken.create({
    email: email.email,
    expiration: expireDate,
    token: fpSalt,
    used: 0,
  });

  //create email
  var uri = encodeURIComponent(fpSalt);
  const message = {
    from: "no-reply@rainflow.live",
    to: req.body.email,
    // replyTo: process.env.REPLYTO_ADDRESS,
    subject: "RainFLOW Network: Forgot Password",
    text:
      "To reset your password, please click the link below:\n" +
      `https://rainflow.live/reset-password/${uri}/${req.body.email}` +
      "\n\n" +
      "If the link doesn't work, please go to https://rainflow.live/reset-password and enter the token below: \n" +
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
      const message = {
        from: "no-reply@rainflow.live",
        to: req.body.email,
        subject: "RainFLOW Network: Password Reset Succesful!",
        text: "This is to confirm you have succesffully reset your password!",
      };

      //send email
      transport.sendMail(message, function (err, info) {
        if (err) {
          console.error(err);
        } else {
          console.log(info);
        }
      });

      return res.json({
        status: "Success",
        message: "Password reset. Please login with your new password.",
      });
    }
  });
};

exports.changePassword = async (req, res) => {
  // console.log(req);
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  jwt.verify(tokenArray[1], config.secret, async function (err, decoded) {
    if (err) {
      res.status(401).send({
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

            const message = {
              from: "no-reply@rainflow.live",
              to: user.email,
              subject: "RainFLOW Network: Password Changed!",
              text: "Your password has been changed.",
            };

            //send email
            transport.sendMail(message, function (err, info) {
              if (err) {
                console.error(err);
              } else {
                console.log(info);
              }
            });
            return res.json({
              status: "Success",
              message:
                "Password is changed. Please login with your new password.",
            });
          }
        });
      } else {
        return res.status(400).json({
          status: "Error",
          message: "Current password is incorrect.",
        });
      }
    }
  });
};

exports.authenticate = async (req, res) => {
  try {
    await User.findOne({
      where: { email: { [Op.iLike]: req.body.email } },
    }).then((user) => {
      if (!user) {
        res.status(400).send({
          status: "Error",
          message: "Cannot login with provided credentials",
        });
      }

      if (
        bcrypt.compareSync(SHA256(req.body.password).toString(), user.password)
      ) {
        const token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: "30d",
        });
        // var badgeImg;
        // if (user.points < 25) badgeImg = "0.png";
        // else if (user.points >= 25 && user.points < 50) badgeImg = "1.png";
        // else if (user.points >= 50 && user.points < 75) badgeImg = "2.png";
        // else if (user.points >= 75 && user.points < 100) badgeImg = "3.png";
        // else badgeImg = null;

        res.json({
          status: "Success",
          data: {
            userID: user.id,
            username: user.username,
            email: user.email,
            tenantID: user.tenantID,
            points: user.points,
            createdAt: user.createdAt,
            badge: getBadge(user.points),
            token: token,
          },
        });
        console.log("User: " + user);
      } else {
        res.status(400).send({
          status: "Error",
          message: "Cannot login with provided credentials",
        });
      }
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};

function getBadge(points) {
  if (points < 10) return null;
  else if (points >= 10 && points < 20) return "0.png";
  else if (points >= 20 && points < 30) return "1.png";
  else if (points >= 30 && points < 40) return "2.png";
  else if (points >= 40 && points < 50) return "3.png";
  else if (points >= 50 && points < 60) return "4.png";
  else if (points >= 60 && points < 70) return "5.png";
  else if (points >= 70 && points < 80) return "6.png";
  else if (points >= 80 && points < 90) return "7.png";
  else if (points >= 90 && points < 100) return "8.png";
  else if (points >= 100 && points < 110) return "9.png";
  else if (points >= 110 && points < 120) return "10.png";
  else if (points >= 120 && points < 130) return "11.png";
  else if (points >= 130 && points < 140) return "12.png";
  else if (points >= 140 && points < 150) return "13.png";
  else if (points >= 150 && points < 160) return "14.png";
  else if (points >= 160 && points < 170) return "15.png";
  else if (points >= 170 && points < 180) return "16.png";
  else if (points >= 180 && points < 190) return "17.png";
  else if (points >= 190 && points < 200) return "18.png";
  else if (points >= 200 && points < 210) return "19.png";
  else if (points >= 210 && points < 220) return "20.png";
  else if (points >= 220 && points < 230) return "21.png";
  else if (points >= 230 && points < 240) return "22.png";
  else if (points >= 240 && points < 250) return "23.png";
  else if (points >= 250 && points < 260) return "24.png";
  else if (points >= 260 && points < 270) return "25.png";
  else if (points >= 270 && points < 280) return "26.png";
  else if (points >= 280 && points < 290) return "27.png";
  else if (points >= 290 && points < 300) return "28.png";
  else if (points >= 300 && points < 310) return "29.png";
  else if (points >= 310 && points < 320) return "30.png";
  else if (points >= 320 && points < 330) return "31.png";
  else if (points >= 330 && points < 340) return "32.png";
  else if (points >= 340 && points < 350) return "33.png";
  else if (points >= 350 && points < 360) return "34.png";
  else if (points >= 360 && points < 370) return "35.png";
  else if (points >= 370 && points < 380) return "36.png";
  else if (points >= 380 && points < 390) return "37.png";
  else if (points >= 390 && points < 400) return "38.png";
  else if (points >= 400 && points < 410) return "39.png";
  else if (points >= 410 && points < 420) return "40.png";
  else if (points >= 420 && points < 430) return "41.png";
  else if (points >= 430 && points < 440) return "42.png";
  else if (points >= 440 && points < 450) return "43.png";
  else if (points >= 450 && points < 460) return "44.png";
  else if (points >= 460 && points < 470) return "45.png";
  else if (points >= 470 && points < 480) return "46.png";
  else if (points >= 480 && points < 490) return "47.png";
  else if (points >= 490 && points < 500) return "48.png";
  else if (points >= 500) return "49.png";
}
