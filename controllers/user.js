const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

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

        if (bcrypt.compareSync(req.body.password, user.password)) {
          const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: "1h",
          });
          res.json({
            status: "Success",
            data: {
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
