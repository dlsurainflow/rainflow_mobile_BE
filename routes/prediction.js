var express = require("express");
var router = express.Router();
var multer = require("multer");

var predictionController = require("../controllers/prediction");

router.post("/predict", predictionController.prediction);
router.post("/predict1", predictionController.predictionWhole);

module.exports = router;
