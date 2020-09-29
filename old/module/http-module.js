function handleGetRequest(response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Get action was requestion");
}

function handlePostRequest(response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Post action was requestion");
}

function handlePutRequest(response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Put action was requestion");
}

function handleDeleteRequest(response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Delete action was requestion");
}

function handleBadRequest(response) {
  console.log("Unsupported HTTP method");
  response.writeHead(400, { "Content-Type": "text/plain" });
  response.end("Bad request");
}

exports.handleRequest = function (request, response) {
  switch (request.method) {
    case "GET":
      handleGetRequest(response);
      break;
    case "POST":
      handlePostRequest(response);
      break;
    case "PUT":
      handlePutRequest(response);
      break;
    case "DELETE":
      handleDeleteRequest(response);
      break;
    default:
      handleBadRequest(response);
      break;
  }
  console.log("Requesting processing completed.");
};
