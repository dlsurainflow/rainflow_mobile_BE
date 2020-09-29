var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
var mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger UI

app.listen(8000);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

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

// mongoose
var user = "wilyfreddie";
var password = "G5610029L";
var host = "rainflow.live";
var database = "rainflow";
var port = 27017;
var mongoDBURI = "mongodb://" + `${host}:${port}/${database}`;
console.log(mongoDBURI);

mongoose.connect("mongodb://rainflow.live:27017/rainflow", {
  auth: { authSource: "admin" },
  user: user,
  pass: password,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));
db.on("connected", () => {
  console.log(`Connected to ${mongoDBURI}`);
});
db.on("disconnected", () => {
  console.log("Disconnected from MongoDB.");
});
module.exports = app;
