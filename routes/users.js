var express = require("express");
var router = express.Router();

var user_controller = require("../controllers/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/test", user_controller.test);
module.exports = router;
