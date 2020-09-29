var http = require("http");
var port = 8180;
var host = "0.0.0.0";
var httpModule = require("./modules/http-module");

http.createServer(httpModule.handleRequest).listen(port, host, () => {
  console.log("Started Node.js HTTP server at http");
});
