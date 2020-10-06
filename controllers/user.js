const { User } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");
var SHA256 = require("crypto-js/sha256");

// Create and Save a new Tutorial
exports.create = (req, res) => {};

exports.authenticate = async (req, res) => {
  console.log(req.body);
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

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  // this.password = bcrypt.hashSync(this.password, saltRounds);
};
