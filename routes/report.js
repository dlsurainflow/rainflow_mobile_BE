var express = require("express");
var router = express.Router();

var userController = require("../controllers/user");
var reportController = require("../controllers/report");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// router.post("/register", userController.create);
// router.post("/authenticate", userController.authenticate);

// router.post("/login", userController.authenticate);

router.post("/submit", reportController.submitReport);
router.get("/all", reportController.returnAll);
router.get("/user/:userID", reportController.findByUserID);
router.get("/:id", reportController.findByID);
router.post("/vote", reportController.voteReport);
router.delete("/vote", reportController.deleteVote);
// router.get("/username/:username", reportController.findByUsername);

module.exports = router;
