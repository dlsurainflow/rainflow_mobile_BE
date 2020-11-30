var express = require("express");
var router = express.Router();
var multer = require("multer");

var raftController = require("../controllers/raft");

router.get("/charts/:deviceID", raftController.returnCharts);
router.get(
  "/charts/history/:deviceID/:start_date/:end_date",
  raftController.returnChartsByDate
);

module.exports = router;
