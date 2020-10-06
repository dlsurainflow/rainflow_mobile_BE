const db = require("../models");
const User = db.user;
const Report = db.report;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

// Create and Save a new Tutorial
exports.submitReport = async (req, res) => {
  console.log(req.body);
  if (jwt.verify(req.body.token, config.secret)) {
  }

  jwt.verify(req.body.token, config.secret, function (err, decoded) {
    if (err) {
      res.status(400).send({
        status: "Error",
        message: err.message,
      });
    } else {
      const report = Report.create({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        rainfall_rate: req.body.rainfall_rate,
        flood_depth: req.body.flood_depth,
        user: req.body.user,
      })
        .then((_report) => res.status(201).send(_report))
        .catch((err) => res.status(400).send(err));
    }
  });
};

exports.returnAll = async (req, res) => {
  Report.findAll({ raw: true }).then(function (report) {
    console.log(report);
    res.status(200).json(report);
  });
};

exports.findByID = async (req, res) => {
  Report.findAll({ where: { id: req.params.userID } }).then(function (report) {
    console.log(report);
    res.status(200).json(report);
  });
};

exports.findByUsername = async (req, res) => {
  Report.findAll({ where: { username: req.params.username } }).then(function (
    report
  ) {
    console.log(report);
    res.status(200).json(report);
  });
};
