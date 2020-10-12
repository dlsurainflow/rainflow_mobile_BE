const { User, Report, ReportHistory, Vote } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");
const fs = require("fs");

exports.submitReport = async (req, res) => {
  console.log(req);
  var token = req.header("Authorization");
  console.log(token);
  var tokenArray = token.split(" ");
  console.log(tokenArray[1]);
  console.log("Body: " + req.body);

  if (!req.body)
    return res.status(400).send({
      status: "Error",
      message: "No paramaters passed",
    });

  if (!req.header("Authorization") || req.header("Authorization") === "")
    return res.status(400).send({
      status: "Error",
      message: "No authentication token provided.",
    });

  if (
    !req.body.latitude ||
    !req.body.longitude ||
    !req.body.flood_depth ||
    !req.body.rainfall_rate
  )
    return res.status(400).send({
      status: "Error",
      message: "Missing paramaters",
    });

  jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
    if (err) {
      res.status(400).send({
        status: "Error",
        message: err.message,
      });
    } else {
      if (!req.files) {
        const report = Report.create({
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          rainfall_rate: req.body.rainfall_rate,
          flood_depth: req.body.flood_depth,
          userID: decoded.id,
        })
          .then((_report) => res.status(201).send(_report))
          .catch((err) => res.status(400).send(err));
      } else {
        var file = req.files.uploaded_image;
        var img_name = file.name;
        file.mv("./public/images/upload_images/" + file.name, function (err) {
          if (err) {
            return res.status(500).send(err);
          } else {
            const report = Report.create({
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              rainfall_rate: req.body.rainfall_rate,
              flood_depth: req.body.flood_depth,
              userID: decoded.id,
              image: image_name,
            })
              .then((_report) => res.status(201).send(_report))
              .catch((err) => res.status(400).send(err));
          }
        });
      }
    }
  });
};

exports.voteReport = async (req, res) => {
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
    if (err) {
      res.status(400).send({
        status: "Error",
        message: err.message,
      });
    } else {
      Vote.findOne({
        where: { userID: decoded.id, reportID: req.body.reportID },
      }).then((_voteExists) => {
        console.log("Vote exists: " + _voteExists);
        if (_voteExists === null) {
          console.log("is null");
          Vote.upsert({
            userID: req.body.userID,
            reportID: req.body.reportID,
            action: req.body.action,
          })
            .then((_report) => res.status(201).send(_report))
            .catch((err) => res.status(400).send(err));
        } else {
          console.log("not null");
          Vote.upsert({
            id: _voteExists.id,
            userID: decoded.id,
            reportID: req.body.reportID,
            action: req.body.action,
          })
            .then((_report) => res.status(201).send(_report))
            .catch((err) => res.status(400).send(err));
        }
      });
    }
  });
};

exports.deleteVote = async (req, res) => {
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  // console.log(req.body);
  jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
    if (err) {
      res.status(401).send({
        status: "Error",
        message: err.message,
      });
    } else {
      Vote.findOne({
        where: { reportID: req.body.reportID, userID: decoded.id },
      }).then((report) => {
        Vote.destroy({ where: { id: report.id } }).then((response) => {
          res.status(200).json({
            status: "Success",
          });
        });
      });
    }
  });
};

exports.returnAll = async (req, res) => {
  Report.findAll({
    raw: true,
    include: [{ model: User, attributes: ["username"] }],
  }).then(function (report) {
    console.log(report);
    res.status(200).json(report);
  });
};

exports.findByID = async (req, res) => {
  if (req.header("Authorization") && req.header("Authorization") !== "") {
    var token = req.header("Authorization");
    var tokenArray = token.split(" ");
    jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
      if (err) {
        res.status(400).send({
          status: "Error",
          message: err.message,
        });
      } else {
        Report.findOne({ where: { id: req.params.id } }).then((report) => {
          Vote.count({
            where: {
              reportID: req.params.id,
              action: "upvote",
            },
          }).then((upvote) => {
            Vote.count({
              where: {
                reportID: req.params.id,
                action: "downvote",
              },
            }).then((downvote) => {
              Vote.findOne({
                where: { reportID: req.params.id, userID: decoded.id },
              }).then((currentAction) => {
                var _currentAction;
                if (currentAction === null) {
                  _currentAction = null;
                } else {
                  _currentAction = currentAction.action;
                }
                res.status(200).json({
                  id: report.id,
                  latitude: report.latitude,
                  longitude: report.longitude,
                  rainfall_rate: report.rainfall_rate,
                  flood_depth: report.flood_depth,
                  createdAt: report.createdAt,
                  userID: report.userID,
                  image: report.image,
                  upvote: upvote,
                  downvote: downvote,
                  currentAction: _currentAction,
                });
              });
            });
          });
        });
      }
    });
  } else {
    Report.findOne({ where: { id: req.params.id } }).then((report) => {
      Vote.count({
        where: {
          reportID: req.params.id,
          action: "upvote",
        },
      }).then((upvote) => {
        Vote.count({
          where: {
            reportID: req.params.id,
            action: "downvote",
          },
        }).then((downvote) => {
          res.status(200).json({
            id: report.id,
            latitude: report.latitude,
            longitude: report.longitude,
            rainfall_rate: report.rainfall_rate,
            flood_depth: report.flood_depth,
            createdAt: report.createdAt,
            userID: report.userID,
            upvote: upvote,
            downvote: downvote,
          });
        });
      });
    });
  }
};

exports.findByUserID = async (req, res) => {
  Report.findAll({ where: { userID: req.params.userID } }).then(function (
    report
  ) {
    console.log(report);
    res.status(200).json(report);
  });
};

exports.deleteReportByID = async (req, res) => {
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
    if (err) {
      res.status(401).send({
        status: "Error",
        message: err.message,
      });
    } else {
      Report.findOne({ where: { id: req.params.id } }).then((_report) => {
        if (_report === null) {
          res.status(400).send({
            status: "Error",
            message: "Report does not exist",
          });
        } else {
          if (_report.image !== null) {
            try {
              fs.unlinkSync(`./public/uploads/reports/${_report.image}`);
              console.log("Removed " + _report.image);
            } catch (e) {
              console.error(e);
            }
          }
          Report.destroy({ where: { id: _report.id } }).then((response) => {
            res.status(200).json({
              status: "Success",
            });
          });
        }
      });
    }
  });
};
