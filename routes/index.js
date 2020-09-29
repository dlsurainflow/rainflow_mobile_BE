var express = require("express");
var router = express.Router();

router.get("/hello", function (req, res) {
  var getParams = url.parse(request.url, true).query;
  if (Object.keys(getParams).length == 0) {
    response.end("Annyeong everyone!");
  } else {
    response.send("Annyeong " + request.params.name);
  }
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
