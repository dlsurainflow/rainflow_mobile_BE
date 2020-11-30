const { User, RAFT, Report, ReportHistory } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

const { Pool } = require("pg");

const pool = new Pool({
  user: "tammy",
  host: "RainFLOW.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

exports.returnAll = async (req, res) => {
  var report = await Report.findAll({
    raw: true,
    include: [
      {
        model: User,
        attributes: ["username", "points"],
      },
    ],
    attributes: [
      "id",
      "latitude",
      "longitude",
      "rainfall_rate",
      "flood_depth",
      "description",
      "createdAt",
      "updatedAt",
      "image",
      "userID",
      "address",
      [Sequelize.literal('"User"."username"'), "username"],
      [Sequelize.literal('"User"."points"'), "points"],
    ],
    order: [["updatedAt", "DESC"]],
    raw: true,
  });

  var raft = await RAFT.findAll({
    order: [["updatedAt", "DESC"]],
    raw: true,
  });

  // console.log(getRainfallRateTitle(50));
  // console.log(JSON.stringify(report));
  for (var i = 0; i < report.length; i++) {
    report[i].rainfall_rate_title = getRainfallRateTitle(
      report[i].rainfall_rate
    );
    report[i].flood_depth_title = getFloodDepthTitle(report[i].flood_depth);
    report[i].marker = getMarkerIcon(
      report[i].rainfall_rate,
      report[i].flood_depth
    );
    report[i].badge = getBadge(report[i].points);
  }

  for (var i = 0; i < raft.length; i++) {
    raft[i].rainfall_rate_title = getRainfallRateTitle(raft[i].rainfall_rate);
    raft[i].flood_depth_title = getFloodDepthTitle(raft[i].flood_depth);
    raft[i].marker = getMarkerIcon(raft[i].rainfall_rate, raft[i].flood_depth);
    var _user = await User.findOne({ where: { username: raft[i].username } });
    raft[i].badge = getBadge(_user.points);
  }

  res.status(200).json({
    mobile: report,
    raft: raft,
  });
};

exports.pushNotification = async (req, res) => {
  var _result = [];

  var report = await Report.findAll({
    attributes: {
      include: [
        [
          Sequelize.fn(
            "ST_Distance",
            Sequelize.col("position"),
            Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
              4326
            )
          ),
          "distance",
        ],
      ],
    },
    where: Sequelize.and(
      Sequelize.where(
        Sequelize.fn(
          "ST_DWithin",
          Sequelize.col("position"),
          Sequelize.fn(
            "ST_SetSRID",
            Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
            4326
          ),
          0.05
        ),
        true
      ),
      {
        [Op.or]: {
          rainfall_rate: {
            [Op.gt]: 2.5,
          },
          flood_depth: {
            [Op.gt]: 10,
          },
        },
      }
    ),
    order: Sequelize.literal("distance ASC"),
  });

  var raft = await RAFT.findAll({
    attributes: {
      include: [
        [
          Sequelize.fn(
            "ST_Distance",
            Sequelize.col("position"),
            Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
              4326
            )
          ),
          "distance",
        ],
      ],
    },
    where: Sequelize.and(
      Sequelize.where(
        Sequelize.fn(
          "ST_DWithin",
          Sequelize.col("position"),
          Sequelize.fn(
            "ST_SetSRID",
            Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
            4326
          ),
          0.05
        ),
        true
      ),
      {
        [Op.or]: {
          rainfall_rate: {
            [Op.gt]: 2.5,
          },
          flood_depth: {
            [Op.gt]: 10,
          },
        },
      }
    ),
    order: Sequelize.literal("distance ASC"),
  });

  for (var i = 0; i < report.length; i++) {
    report[i].dataValues.rainfall_rate_title = getRainfallRateTitle(
      report[i].rainfall_rate
    );
    report[i].dataValues.flood_depth_title = getFloodDepthTitle(
      report[i].flood_depth
    );
    report[i].dataValues.marker = getMarkerIcon(
      report[i].rainfall_rate,
      report[i].flood_depth
    );
  }
  // _result.push(report);

  for (var i = 0; i < raft.length; i++) {
    raft[i].dataValues.rainfall_rate_title = getRainfallRateTitle(
      raft[i].rainfall_rate
    );
    raft[i].dataValues.flood_depth_title = getFloodDepthTitle(
      raft[i].flood_depth
    );
    raft[i].dataValues.marker = getMarkerIcon(
      raft[i].rainfall_rate,
      raft[i].flood_depth
    );
  }

  // _result.push(raft);

  _result = report.concat(raft);
  _result.sort(function (a, b) {
    return a.dataValues.distance - b.dataValues.distance;
  });
  res.status(200).json(_result);

  // var test = report.concat(raft);
  // console.log(test);
};

exports.summary = async (req, res) => {
  var _result = [];

  var report = await Report.findAll({
    where: {
      [Op.or]: {
        rainfall_rate: {
          [Op.gt]: 2.5,
        },
        flood_depth: {
          [Op.gt]: 10,
        },
      },
    },
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
    attributes: [
      "id",
      "latitude",
      "longitude",
      "rainfall_rate",
      "flood_depth",
      "updatedAt",
      "address",
      "userID",
      [Sequelize.literal('"User"."username"'), "username"],
    ],
  });

  for (var i = 0; i < report.length; i++) {
    report[i].dataValues.rainfall_rate_title = getRainfallRateTitle(
      report[i].rainfall_rate
    );
    report[i].dataValues.flood_depth_title = getFloodDepthTitle(
      report[i].flood_depth
    );
    report[i].dataValues.marker = getMarkerIcon(
      report[i].rainfall_rate,
      report[i].flood_depth
    );
  }

  _result.push(report);

  var raft = await RAFT.findAll({
    where: {
      [Op.or]: {
        rainfall_rate: {
          [Op.gt]: 10,
        },
        flood_depth: {
          [Op.gt]: 100,
        },
      },
    },
    attributes: [
      "id",
      "latitude",
      "longitude",
      "rainfall_rate",
      "flood_depth",
      "updatedAt",
      "address",
      "username",
    ],
  });

  for (var i = 0; i < raft.length; i++) {
    raft[i].dataValues.rainfall_rate_title = getRainfallRateTitle(
      raft[i].rainfall_rate
    );
    raft[i].dataValues.flood_depth_title = getFloodDepthTitle(
      raft[i].flood_depth
    );
    raft[i].dataValues.marker = getMarkerIcon(
      raft[i].rainfall_rate,
      raft[i].flood_depth
    );
  }

  _result.push(raft);

  res.status(200).json(_result);
};

exports.returnSnapshot = async (req, res) => {
  var report = await ReportHistory.findAll({
    raw: true,
    include: [
      {
        model: User,
        attributes: ["username", "points"],
      },
    ],
    attributes: [
      "id",
      "latitude",
      "longitude",
      "rainfall_rate",
      "flood_depth",
      "description",
      "createdAt",
      "updatedAt",
      "image",
      "upvote",
      "downvote",
      "userID",
      "address",
      [Sequelize.literal('"User"."username"'), "username"],
      [Sequelize.literal('"User"."points"'), "points"],
    ],
    order: [["updatedAt", "DESC"]],
    where: [
      {
        createdAt: {
          [Op.between]: [
            req.params.start_date + "T00:00:00.000Z",
            req.params.end_date + "T00:00:00.000Z",
          ],
        },
      },
    ],
    raw: true,
  });

  var raft = await RAFT.findAll({
    where: [
      {
        createdAt: {
          [Op.gte]: req.params.start_date + "T00:00:00.000Z",
        },
      },
    ],
    raw: true,
  });

  for (var i = 0; i < report.length; i++) {
    report[i].rainfall_rate_title = getRainfallRateTitle(
      report[i].rainfall_rate
    );
    report[i].flood_depth_title = getFloodDepthTitle(report[i].flood_depth);
    report[i].marker = getMarkerIcon(
      report[i].rainfall_rate,
      report[i].flood_depth
    );
    report[i].badge = getBadge(report[i].points);
  }

  for (var i = 0; i < raft.length; i++) {
    var sql_FD1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${raft[i].deviceID}' and data.key = 'FD1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}' order by value desc limit 1;`;
    var sql_RR1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${raft[i].deviceID}' and data.key = 'RR1' and "msgTime" >= '${req.params.start_date}' and "msgTime" < '${req.params.end_date}' order by value desc limit 1;`;
    var FD1 = await pool.query(sql_FD1);
    var RR1 = await pool.query(sql_RR1);

    raft[i].rainfall_rate = RR1.rows[0].value;
    raft[i].flood_depth = FD1.rows[0].value;
    raft[i].rainfall_rate_title = getRainfallRateTitle(RR1.rows[0].value);
    raft[i].flood_depth_title = getFloodDepthTitle(FD1.rows[0].value);
    raft[i].marker = getMarkerIcon(RR1.rows[0].value, FD1.rows[0].value);
    var _user = await User.findOne({ where: { username: raft[i].username } });
    raft[i].badge = getBadge(_user.points);
  }

  res.status(200).json({
    mobile: report,
    raft: raft,
  });
};

function getRainfallRateTitle(rainfall_rate) {
  if (rainfall_rate === 0) {
    return "No Rain";
  } else if (rainfall_rate > 0 && rainfall_rate < 2.5) {
    return "Light Rain";
  } else if (rainfall_rate >= 2.5 && rainfall_rate < 7.5) {
    return "Moderate Rain";
  } else if (rainfall_rate >= 7.5 && rainfall_rate < 15) {
    return "Heavy Rain";
  } else if (rainfall_rate >= 15 && rainfall_rate < 30) {
    return "Intense Rain";
  } else if (rainfall_rate >= 30) {
    return "Torrential Rain";
  }
}

function getFloodDepthTitle(flood_depth) {
  if (flood_depth <= 10) {
    return "No Flood";
  } else if (flood_depth > 10 && flood_depth <= 25) {
    return "Ankle Deep";
  } else if (flood_depth > 25 && flood_depth <= 70) {
    return "Knee Deep";
  } else if (flood_depth > 70 && flood_depth <= 120) {
    return "Waist Deep";
  } else if (flood_depth > 120 && flood_depth <= 160) {
    return "Neck Deep";
  } else if (flood_depth > 160 && flood_depth <= 200) {
    return "Top of Head Deep";
  } else if (flood_depth > 200 && flood_depth <= 300) {
    return "1-Storey High";
  } else if (flood_depth > 300 && flood_depth <= 450) {
    return "1.5-Storeys High";
  } else if (flood_depth > 450) {
    return "2-Storey or Higher";
  }
}

function getMarkerIcon(rainfall_rate, flood_depth) {
  var _return = "";

  if (rainfall_rate === 0) {
    _return += "A";
  } else if (rainfall_rate > 0 && rainfall_rate < 2.5) {
    _return += "B";
  } else if (rainfall_rate >= 2.5 && rainfall_rate < 7.5) {
    _return += "C";
  } else if (rainfall_rate >= 7.5 && rainfall_rate < 15) {
    _return += "D";
  } else if (rainfall_rate >= 15 && rainfall_rate < 30) {
    _return += "E";
  } else if (rainfall_rate >= 30) {
    _return += "F";
  }

  if (flood_depth <= 10) {
    _return += "A";
  } else if (flood_depth > 10 && flood_depth <= 25) {
    _return += "B";
  } else if (flood_depth > 25 && flood_depth <= 70) {
    _return += "C";
  } else if (flood_depth > 70 && flood_depth <= 120) {
    _return += "D";
  } else if (flood_depth > 120 && flood_depth <= 160) {
    _return += "E";
  } else if (flood_depth > 160 && flood_depth <= 200) {
    _return += "F";
  } else if (flood_depth > 200 && flood_depth <= 300) {
    _return += "G";
  } else if (flood_depth > 300 && flood_depth <= 450) {
    _return += "H";
  } else if (flood_depth > 450) {
    _return += "I";
  }

  return _return;
}

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
