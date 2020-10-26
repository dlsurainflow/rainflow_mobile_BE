const { User, RAFT, Report, Vote } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");
const openGeocoder = require("node-open-geocoder");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

exports.returnAll = async (req, res) => {
  var report = await Report.findAll({
    raw: true,
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
      "description",
      "createdAt",
      "updatedAt",
      "image",
      "userID",
      [Sequelize.literal('"User"."username"'), "username"],
    ],
    order: [["updatedAt", "DESC"]],
    raw: true,
  });
  var raft = await RAFT.findAll({
    order: [["updatedAt", "DESC"]],
    raw: true,
  });

  console.log(getRainfallRateTitle(50));
  console.log(JSON.stringify(report));
  for (var i = 0; i < report.length; i++) {
    report[i].rainfall_rate_title = getRainfallRateTitle(
      report[i].rainfall_rate
    );
    report[i].flood_depth_title = getFloodDepthTitle(report[i].flood_depth);
    report[i].marker = getMarkerIcon(
      report[i].rainfall_rate,
      report[i].flood_depth
    );
  }

  for (var i = 0; i < raft.length; i++) {
    // const res = await geocoder.reverse({
    //   lat: raft[i].latitude,
    //   lon: raft[i].longitude,
    // });
    // raft[i].dataValues.address = res[0].formattedAddress;
    raft[i].rainfall_rate_title = getRainfallRateTitle(raft[i].rainfall_rate);
    raft[i].flood_depth_title = getFloodDepthTitle(raft[i].flood_depth);
    raft[i].marker = getMarkerIcon(raft[i].rainfall_rate, raft[i].flood_depth);
  }

  res.status(200).json({
    mobile: report,
    raft: raft,
  });

  // Report.findAll({
  //   raw: true,
  //   include: [
  //     {
  //       model: User,
  //       attributes: ["username"],
  //     },
  //   ],
  //   attributes: [
  //     "id",
  //     "latitude",
  //     "longitude",
  //     "rainfall_rate",
  //     "flood_depth",
  //     "description",
  //     "createdAt",
  //     "updatedAt",
  //     "image",
  //     "userID",
  //     [Sequelize.literal('"User"."username"'), "username"],
  //   ],
  //   order: [["updatedAt", "DESC"]],
  //   raw: true,
  // }).then(function (report) {
  //   RAFT.findAll({
  //     order: [["updatedAt", "DESC"]],
  //     raw: true,
  //   }).then(function (raft) {
  //     res.status(200).json({
  //       mobile: report,
  //       raft: raft,
  //     });
  //   });
  // });
};

exports.pushNotification = async (req, res) => {
  Report.findAll({
    where: Sequelize.where(
      Sequelize.fn(
        "ST_DWithin",
        Sequelize.col("position"),
        Sequelize.fn(
          "ST_SetSRID",
          Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
          4326
        ),
        0.032
      ),
      true
    ),
  })
    .then((report) => {
      RAFT.findAll({
        where: Sequelize.where(
          Sequelize.fn(
            "ST_DWithin",
            Sequelize.col("position"),
            Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_Point", req.body.longitude, req.body.latitude),
              4326
            ),
            0.032
          ),
          true
        ),
      })
        .then((raft) => {
          res.status(200).json({ mobile: report, raft: raft });
        })
        .catch((err) => console.err(err));
    })
    .catch((err) => console.err(err));
};

exports.summary = async (req, res) => {
  var _result = [];

  var report = await Report.findAll({
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
      // "description",
      // "image",
      "userID",
      [Sequelize.literal('"User"."username"'), "username"],
    ],
  });

  
  for (var i = 0; i < report.length; i++) {
    // const res = await geocoder.reverse({
    //   lat: raft[i].latitude,
    //   lon: raft[i].longitude,
    // });
    // raft[i].dataValues.address = res[0].formattedAddress;
    report[i].dataValues.rainfall_rate_title = getRainfallRateTitle(report[i].rainfall_rate);
    report[i].dataValues.flood_depth_title = getFloodDepthTitle(report[i].flood_depth);
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
      "username",
    ],
  });

   for (var i = 0; i < raft.length; i++) {
     // const res = await geocoder.reverse({
     //   lat: raft[i].latitude,
     //   lon: raft[i].longitude,
     // });
     // raft[i].dataValues.address = res[0].formattedAddress;
     raft[i].dataValues.rainfall_rate_title = getRainfallRateTitle(raft[i].rainfall_rate);
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

function getRainfallRateTitle(rainfall_rate) {
  console.log("I reached here: ", rainfall_rate);
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
