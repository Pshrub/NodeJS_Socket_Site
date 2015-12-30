var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./lib/chat_server.js')

// helper functions to server static HTTP files.
// handle the sending of 404 errors

function webserver() {
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found');
  response.end();
}

// handles the sending of HTTP headers and file contents
function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200, {"content-type":
    mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// determines if a file is cached in memory. if so, it serves it.
// if the file is not cached, it's read from disk.
function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

// create the HTTP server
var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html'; // specify the default page to be served
  } else {
    filePath = 'public' + request.url;
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

// start the HTTP server

server.listen(3000, function() {
  console.log("Server listening on port 3000");
});

// opens a channel for the chat server to listen to the server (socket IO)
chatServer.listen(server)

return server
}

module.exports = webserver;
webserver();
