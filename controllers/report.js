const { User, Report, ReportHistory, Vote } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");
const fs = require("fs");

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
    jwt.verify(tokenArray[1], config.secret, async function (err, decoded) {
      if (err) {
        res.status(400).send({
          status: "Error",
          message: err.message,
        });
      } else {
        var report = await Report.findOne({ where: { id: req.params.id } });
        var upvote = await Vote.count({
          where: {
            reportID: req.params.id,
            action: "upvote",
          },
        });
        var downvote = await Vote.count({
          where: {
            reportID: req.params.id,
            action: "downvote",
          },
        });
        var _currentAction;
        await Vote.findOne({
          where: { reportID: req.params.id, userID: decoded.id },
        }).then((res) => {
          if (res === null) {
            _currentAction = null;
          } else _currentAction = res.action;
        });

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
      }
    });
  } else {
    var report = await Report.findOne({ where: { id: req.params.id } });
    var upvote = await Vote.count({
      where: {
        reportID: req.params.id,
        action: "upvote",
      },
    });
    var downvote = await Vote.count({
      where: {
        reportID: req.params.id,
        action: "downvote",
      },
    });

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
    });
  }
};

exports.findByIDHistory = async (req, res) => {
  if (req.header("Authorization") === undefined) {
    res.status(401).send({
      status: "Error",
      message: "Authorization token not provided.",
    });
  } else {
    var token = req.header("Authorization");
    var tokenArray = token.split(" ");
    jwt.verify(tokenArray[1], config.secret, async function (err, decoded) {
      if (err) {
        res.status(401).send({
          status: "Error",
          message: err.message,
        });
      } else {
        var report = await ReportHistory.findOne({
          where: { id: req.params.id },
        });
        res.status(200).json(report);
      }
    });
  }
};

exports.findByUserID = async (req, res) => {
  const active = await Report.findAll({ where: { userID: req.params.userID } });
  const archive = await ReportHistory.findAll({
    where: { userID: req.params.userID },
  });

  res.status(200).json({ active: active, archive: archive });
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
