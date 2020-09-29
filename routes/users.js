var express = require("express");
var router = express.Router();

var userController = require("../controllers/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// router.post("/register", userController.create);
// router.post("/authenticate", userController.authenticate);

router.post("/login", userController.authenticate);

module.exports = router;
