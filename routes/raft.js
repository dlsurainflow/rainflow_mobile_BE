var express = require("express");
var router = express.Router();
var multer = require("multer");

var raftController = require("../controllers/raft");

router.get("/charts/:deviceID", raftController.returnCharts);

module.exports = router;
