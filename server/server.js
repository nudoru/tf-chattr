var socket_io = require('socket.io');
var http      = require('http');
var express   = require('express');

var app = express();
app.use(express.static('bin'));

var server = http.Server(app);
var io     = socket_io(server);

var connectionsMap   = Object.create(null),
    connectionsCount = 0;

function addConnectionToMap(id) {
  connectionsMap[id] = {
    nick     : 'Anonymous' + connectionsCount++,
    connected: true,
    messages : []
  };
}

function getConnectionsMapForID(id) {
  return connectionsMap[id];
}

function getActiveUsersList() {
  var arry = [];
  for (var user in connectionsMap) {
    if (connectionsMap[user].connected === true) {
      arry.push(connectionsMap[user].nick);
    }
  }
  return arry;
}

io.on('connection', function (socket) {
  var id = socket.id;

  console.log('Client connected', id);

  addConnectionToMap(id);

  socket.emit('userupdate', getActiveUsersList());

  socket.emit('message', {
    username: 'System',
    message : 'Welcome to Chattr!'
  });

  socket.broadcast.emit('message', {
    username: 'System',
    message : getConnectionsMapForID(id).nick + ' has joined.'
  });

  socket.on('message', function (message) {
    console.log(id, 'message:', message.username, message.message);
    getConnectionsMapForID(id).messages.push(message.message);
    socket.broadcast.emit('message', {
      username: getConnectionsMapForID(id).nick,
      message : message.message
    });
  });

  socket.on('nickchange', function (nick) {
    var oldnick                     = getConnectionsMapForID(id).nick
    getConnectionsMapForID(id).nick = nick;
    socket.emit('userupdate', getActiveUsersList());

    socket.emit('message', {
      username: 'System',
      message : oldnick + '  changed nick to ' + nick + '.'
    });
  });

  socket.on('disconnect', function () {
    console.log('disconnect');
    getConnectionsMapForID(id).connected = false;
    socket.emit('userupdate', getActiveUsersList());
    io.emit('user disconnected');
  });
});

server.listen(8080);