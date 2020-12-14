const { User, RAFT, Report, ReportHistory } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

exports.prediction = async (req, res) => {
  var RR_H1 = parseFloat(req.body.RR_H1 / 10); // in: mm/hour out: cm/hour
  var T_H1 = parseFloat(req.body.T_H1 / 60); // in: min out: hour
  var RR_H2 = parseFloat(req.body.RR_H2 / 10);
  var T_H2 = parseFloat(req.body.T_H2 / 60);
  var RR_H3 = parseFloat(req.body.RR_H3 / 10);
  var T_H3 = parseFloat(req.body.T_H3 / 60);

  var RR_M1 = parseFloat(req.body.RR_M1 / 10); // in: mm/hour out: cm/hour
  var T_M1 = parseFloat(req.body.T_M1 / 60); // in: min out: hour
  var RR_M2 = parseFloat(req.body.RR_M2 / 10);
  var T_M2 = parseFloat(req.body.T_M2 / 60);
  var RR_M3 = parseFloat(req.body.RR_M3 / 10);
  var T_M3 = parseFloat(req.body.T_M3 / 60);

  var RR_L1 = parseFloat(req.body.RR_L1 / 10); // in: mm/hour out: cm/hour
  var T_L1 = parseFloat(req.body.T_L1 / 60); // in: min out: hour
  var RR_L2 = parseFloat(req.body.RR_L2 / 10);
  var T_L2 = parseFloat(req.body.T_L2 / 60);
  var RR_L3 = parseFloat(req.body.RR_L3 / 10);
  var T_L3 = parseFloat(req.body.T_L3 / 60);

  var FD_H_Prev = parseFloat(req.body.FD_H_Prev); // in: cm
  var FD_M_Prev = parseFloat(req.body.FD_M_Prev);
  var FD_L_Prev = parseFloat(req.body.FD_L_Prev);

  const T_H = parseFloat(req.body.T_A / 60); // in hours
  const T_M = parseFloat(req.body.T_A / 60);
  const T_L = parseFloat(req.body.T_A / 60);

  const A_H1 = 31415.93;
  const A_H2 = 31415.93;
  const A_H3 = 282743.34;
  const A_HT = 2010619.3;

  const A_M1 = 282743.34;
  const A_M2 = 31415.93;
  const A_M3 = 125663.71;
  const A_MT = 2010619.3;

  const A_L1 = 31415.93;
  const A_L2 = 125663.706;
  const A_L3 = 31415.93;
  const A_LT = 2010619.3;

  var InFlow_H = 0; // cm/hour
  var OutFlow_H = FD_H_Prev / 3;

  var InFlow_M = OutFlow_H;
  var OutFlow_M = FD_M_Prev / 4;

  var InFlow_L = OutFlow_M;
  var OutFlow_L = FD_L_Prev / 5;

  var FD_H =
    RR_H1 * T_H1 * (A_H1 / A_HT) +
    RR_H2 * T_H2 * (A_H2 / A_HT) +
    RR_H3 * T_H3 * (A_H3 / A_HT) +
    (InFlow_H - OutFlow_H) * T_H +
    FD_H_Prev;

  console.log(RR_H1 * T_H1 * (A_H1 / A_HT));
  console.log(RR_H2 * T_H2 * (A_H2 / A_HT));
  console.log(RR_H3 * T_H3 * (A_H3 / A_HT));
  console.log((InFlow_H - OutFlow_H) * T_H);
  console.log(FD_H_Prev);
  console.log(FD_H);

  var FD_M =
    RR_M1 * T_M1 * (A_M1 / A_MT) +
    RR_M2 * T_M2 * (A_M2 / A_MT) +
    RR_M3 * T_M3 * (A_M3 / A_MT) +
    (InFlow_M - OutFlow_M) * T_M +
    FD_M_Prev;

  var FD_L =
    RR_L1 * T_L1 * (A_L1 / A_LT) +
    RR_L2 * T_L2 * (A_L2 / A_LT) +
    RR_L3 * T_L3 * (A_L3 / A_LT) +
    (InFlow_L - OutFlow_L) * T_L +
    FD_L_Prev;

  if (Math.sign(FD_H) === -1) FD_H = 0;
  if (Math.sign(FD_M) === -1) FD_M = 0;
  if (Math.sign(FD_L) === -1) FD_L = 0;

  res.status(200).json({
    FD_H: FD_H,
    FD_M: FD_M,
    FD_L: FD_L,
  });
  // FD in cm
  // RR in mm/hr
  // T in hr
  // InFlow and OutFlow in cm/hr
  // A in m

  // Expected inputs from FE:
  // RR_H1, RR_H2, RR_H3
  // T_H1, T_H2, T_H3
  // FD_H_Prev, FD_M_Prev, FD_L_Prev

  // Outputs from BE:
  // FD_H, FD_M, FD_L
};

exports.predictionWhole = async (req, res) => {
  var RR_H1 = parseFloat(req.body.RR_H1 / 10); // in: mm/hour out: cm/hour
  var T_H1 = parseFloat(req.body.T_H1 / 60); // in: min out: hour
  // var RR_H2 = parseFloat(req.body.RR_H2 / 10);
  // var T_H2 = parseFloat(req.body.T_H2 / 60);
  // var RR_H3 = parseFloat(req.body.RR_H3 / 10);
  // var T_H3 = parseFloat(req.body.T_H3 / 60);

  var RR_M1 = parseFloat(req.body.RR_M1 / 10); // in: mm/hour out: cm/hour
  var T_M1 = parseFloat(req.body.T_M1 / 60); // in: min out: hour
  // var RR_M2 = parseFloat(req.body.RR_M2 / 10);
  // var T_M2 = parseFloat(req.body.T_M2 / 60);
  // var RR_M3 = parseFloat(req.body.RR_M3 / 10);
  // var T_M3 = parseFloat(req.body.T_M3 / 60);

  var RR_L1 = parseFloat(req.body.RR_L1 / 10); // in: mm/hour out: cm/hour
  var T_L1 = parseFloat(req.body.T_L1 / 60); // in: min out: hour
  // var RR_L2 = parseFloat(req.body.RR_L2 / 10);
  // var T_L2 = parseFloat(req.body.T_L2 / 60);
  // var RR_L3 = parseFloat(req.body.RR_L3 / 10);
  // var T_L3 = parseFloat(req.body.T_L3 / 60);

  var FD_H_Prev = parseFloat(req.body.FD_H_Prev); // in: cm
  var FD_M_Prev = parseFloat(req.body.FD_M_Prev);
  var FD_L_Prev = parseFloat(req.body.FD_L_Prev);

  const T_H = parseFloat(req.body.T_A / 60); // in hours
  const T_M = parseFloat(req.body.T_A / 60);
  const T_L = parseFloat(req.body.T_A / 60);

  // const A_H1 = 31415.93;
  // const A_H2 = 31415.93;
  // const A_H3 = 282743.34;
  const A_HT = 2010619.3;

  // const A_M1 = 282743.34;
  // const A_M2 = 31415.93;
  // const A_M3 = 125663.71;
  const A_MT = 2010619.3;

  // const A_L1 = 31415.93;
  // const A_L2 = 125663.706;
  // const A_L3 = 31415.93;
  const A_LT = 2010619.3;

  var InFlow_H = 0; // cm/hour
  var OutFlow_H = FD_H_Prev / 3;
  var InFlow_M = OutFlow_H;
  var OutFlow_M = FD_M_Prev / 4;
  var InFlow_L = OutFlow_M;
  var OutFlow_L = FD_L_Prev / 5;

  var FD_H =
    RR_H1 * T_H1 * (A_HT / A_HT) + (InFlow_H - OutFlow_H) * T_H + FD_H_Prev / 1;

  var FD_M =
    RR_M1 * T_M1 * (A_MT / A_MT) + (InFlow_M - OutFlow_M) * T_M + FD_M_Prev / 1;

  var FD_L =
    RR_L1 * T_L1 * (A_LT / A_LT) + (InFlow_L - OutFlow_L) * T_L + FD_L_Prev / 1;

  if (Math.sign(FD_H) === -1) FD_H = 0;
  if (Math.sign(FD_M) === -1) FD_M = 0;
  if (Math.sign(FD_L) === -1) FD_L = 0;

  res.status(200).json({
    FD_H: FD_H,
    FD_M: FD_M,
    FD_L: FD_L,
  });
  // FD in cm
  // RR in mm/hr
  // T in hr
  // InFlow and OutFlow in cm/hr
  // A in m

  // Expected inputs from FE:
  // RR_H1, RR_H2, RR_H3
  // T_H1, T_H2, T_H3
  // FD_H_Prev, FD_M_Prev, FD_L_Prev

  // Outputs from BE:
  // FD_H, FD_M, FD_L
};
