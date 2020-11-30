var express = require("express");
var router = express.Router();

var mapController = require("../controllers/map");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// router.post("/register", userController.create);
// router.post("/authenticate", userController.authenticate);

// router.post("/login", userController.authenticate);

router.get("/all", mapController.returnAll);
router.post("/push", mapController.pushNotification);
router.get("/summary", mapController.summary);
router.get("/snapshot/:start_date/:end_date ", mapController.returnSnapshot);

module.exports = router;
