var express = require("express");
var router = express.Router();
var multer = require("multer");

var userController = require("../controllers/user");
var reportController = require("../controllers/report");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/all", reportController.returnAll);
router.get("/user/:userID", reportController.findByUserID);
router.get("/:id", reportController.findByID);
router.delete("/:id", reportController.deleteReportByID);
router.post("/vote", reportController.voteReport);
router.delete("/vote", reportController.deleteVote);

module.exports = router;
