var socket_io = require('socket.io');
var http      = require('http');
var express   = require('express');

var app = express();
app.use(express.static('bin'));

var server = http.Server(app);
var io     = socket_io(server);

io.on('connection', function (socket) {
  console.log('Client connected');

  socket.on('message', function (message) {
    console.log('Received message:', message.username, message.message);
    socket.broadcast.emit('message', {
      username: message.username,
      message : message.message
    });
  });
});

server.listen(8080);