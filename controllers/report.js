const { User, Report, ReportHistory, Vote } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

// Create and Save a new Tutorial
exports.submitReport = async (req, res) => {
  if (!req.body)
    return res.status(400).send({
      status: "Error",
      message: "No paramaters passed",
    });

  if (!req.body.token || req.body.token === "")
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
        userID: decoded.id,
      })
        .then((_report) => res.status(201).send(_report))
        .catch((err) => res.status(400).send(err));
    }
  });
};

exports.voteReport = async (req, res) => {
  console.log(req.body);
  jwt.verify(req.body.token, config.secret, function (err, decoded) {
    if (err) {
      res.status(400).send({
        status: "Error",
        message: err.message,
      });
    } else {
      const vote = Vote.findOne({
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

async function voteExists(userID, reportID) {
  return Vote.count({ where: { userID: userID, reportID: reportID } }).then(
    (count) => {
      // console.log(count);
      if (count == 0) {
        return false;
      }
      return true;
    }
  );
}

async function reportExists(reportID) {
  return Report.count({ where: { id: reportID } }).then((count) => {
    // console.log(count);
    if (count == 0) {
      return false;
    }
    return true;
  });
}

exports.deleteVote = async (req, res) => {
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
      // const report = Report.create({
      //   latitude: req.body.latitude,
      //   longitude: req.body.longitude,
      //   rainfall_rate: req.body.rainfall_rate,
      //   flood_depth: req.body.flood_depth,
      //   user: req.body.user,
      // })
      //   .then((_report) => res.status(201).send(_report))
      //   .catch((err) => res.status(400).send(err));
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
  if (req.body.token && req.body.token !== "") {
    jwt.verify(req.body.token, config.secret, function (err, decoded) {
      if (err) {
        res.status(400).send({
          status: "Error",
          message: err.message,
        });
      } else {
        console.log(decoded.id);
        // const decoded = JSON.dec
        // console.log(jwt.decode(req.body.token, { complete: true }));
        Report.findOne({ where: { id: req.params.id } }).then((report) => {
          console.log(report);
          Vote.count({
            where: {
              reportID: req.params.id,
              action: "upvote",
            },
          }).then((upvote) => {
            console.log(upvote);
            Vote.count({
              where: {
                reportID: req.params.id,
                action: "downvote",
              },
            }).then((downvote) => {
              Vote.findOne({
                where: { reportID: req.params.id, userID: decoded.id },
              }).then((currentAction) => {
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
                  currentAction: currentAction.action,
                });
              });
            });
          });
          // res.status(200).json(report);
        });
      }
    });
  } else {
    Report.findOne({ where: { id: req.params.id } }).then((report) => {
      console.log(report);
      Vote.count({
        where: {
          reportID: req.params.id,
          action: "upvote",
        },
      }).then((upvote) => {
        console.log(upvote);
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
      // res.status(200).json(report);
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

// exports.findByUsername = async (req, res) => {
//   Report.findAll({ where: { username: req.params.username } }).then(function (
//     report
//   ) {
//     console.log(report);
//     res.status(200).json(report);
//   });
// };
