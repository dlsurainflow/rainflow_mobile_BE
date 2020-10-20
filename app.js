var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
var multer = require("multer");
var path = require("path");
var corsOptions = {
  origin: "http://rainflow.live/api",
};
const jwt = require("jsonwebtoken");
const config = require("./config/jwt.config.js");
const { Report } = require("./models");

var app = express();

const db = require("./models");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.listen(8085);
// app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// init and configure passport
// app.use(passport.initialize());

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const reportRouter = require("./routes/report");
const mapRouter = require("./routes/map");

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/report", reportRouter);
app.use("/map", mapRouter);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // path.join(__dirname,'../upload'))
    cb(null, path.join(__dirname, "./public/uploads/reports/"));
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
}).single("image");

const authentication = function (req, res, next) {
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  jwt.verify(tokenArray[1], config.secret, function (err, decoded) {
    if (err) {
      next();
      console.log("Error!");
      res.status(401).send({
        status: "Error",
        message: err.message,
      });
    } else {
      return next();
    }
  });
};

app.post("/report/submit", authentication, upload, function (req, res) {
  // console.log(req);
  var token = req.header("Authorization");
  var tokenArray = token.split(" ");
  var decoded = jwt.verify(tokenArray[1], config.secret);

  if (
    !req.body.latitude ||
    !req.body.longitude ||
    !req.body.flood_depth ||
    !req.body.rainfall_rate
  )
    return res.status(400).send({
      status: "Error",
      message: "Missing paramaters",
    });

  if (!req.file) {
    let point = {
      type: "Point",
      coordinates: [req.body.longitude, req.body.latitude],
      crs: { type: "name", properties: { name: "EPSG:4326" } },
    };

    const report = Report.create({
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      rainfall_rate: req.body.rainfall_rate,
      flood_depth: req.body.flood_depth,
      userID: decoded.id,
      position: point,
    })
      .then((_report) => res.status(201).send(_report))
      .catch((err) => {
        console.error(err);
        res.status(400).send(err);
      });
  } else {
    let point = {
      type: "Point",
      coordinates: [req.body.longitude, req.body.latitude],
      crs: { type: "name", properties: { name: "EPSG:4326" } },
    };

    const report = Report.create({
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      rainfall_rate: req.body.rainfall_rate,
      flood_depth: req.body.flood_depth,
      userID: decoded.id,
      image: req.file.filename,
      position: point,
    })
      .then((_report) => res.status(201).send(_report))
      .catch((err) => {
        console.error(err);
        res.status(400).send(err);
      });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

console.log("App is listening on port 8085.");

module.exports = app;
