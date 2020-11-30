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
  jwt.verify(tokenArray[1], config.secret, async function (err, decoded) {
    if (err) {
      res.status(401).send({
        status: "Error",
        message: err.message,
      });
    } else {
      var vote = await Vote.findOne({
        where: { userID: decoded.id, reportID: req.body.reportID },
      });
      console.log(vote);

      if (vote === null) {
        Vote.create({
          userID: decoded.id,
          reportID: req.body.reportID,
          action: req.body.action,
        })
          .then((_report) => res.status(201).send(_report))
          .catch((err) => res.status(400).send(err));
      } else {
        Vote.update(
          {
            action: req.body.action,
          },
          {
            where: {
              id: vote.id,
            },
          }
        )
          .then((_report) => res.status(201).send(_report))
          .catch((err) => res.status(400).send(err));
      }
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
        var report = await Report.findOne({
          where: {
            id: req.params.id,
          },
          include: [
            {
              model: User,
              attributes: ["points"],
            },
          ],
        });
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
        res.status(200).send({
          status: "Error",
          message: err.message,
          id: report.id,
          latitude: report.latitude,
          longitude: report.longitude,
          rainfall_rate: report.rainfall_rate,
          flood_depth: report.flood_depth,
          createdAt: report.createdAt,
          userID: report.userID,
          image: report.image,
          address: report.address,
          description: report.description,
          badge: getBadge(report.User.points),
          upvote: upvote,
          downvote: downvote,
        });
      } else {
        // var report = await Report.findOne({ where: { id: req.params.id } });
        var report = await Report.findOne({
          where: {
            id: req.params.id,
          },
          include: [
            {
              model: User,
              attributes: ["points"],
            },
          ],
        });
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
          description: report.description,
          address: report.address,
          badge: getBadge(report.User.points),
          upvote: upvote,
          downvote: downvote,
          currentAction: _currentAction,
        });
      }
    });
  } else {
    // var report = await Report.findOne({ where: { id: req.params.id } });
    var report = await Report.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: User,
          attributes: ["points"],
        },
      ],
    });
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
      description: report.description,
      address: report.address,
      badge: getBadge(report.User.points),
      upvote: upvote,
      downvote: downvote,
    });
  }
};

exports.findByIDHistory = async (req, res) => {
//   if (req.header("Authorization") === undefined) {
//     res.status(401).send({
//       status: "Error",
//       message: "Authorization token not provided.",
//     });
//   } else {
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
//   }
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
