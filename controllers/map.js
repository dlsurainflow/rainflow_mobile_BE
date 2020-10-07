const { User, RAFT, Report } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

exports.returnAll = async (req, res) => {
  Report.findAll({
    raw: true,
    include: [{ model: User, attributes: ["username"] }],
  }).then(function (report) {
    RAFT.findAll({
      raw: true,
    }).then(function (raft) {
      // console.log(report);
      // console.log(raft);
      res.status(200).json({
        mobile: report,
        raft: raft,
      });
    });
  });
};
