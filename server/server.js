var socket_io        = require('socket.io'),
    http             = require('http'),
    express          = require('express'),
    app              = express(),
    server, io,
    connectionsMap   = Object.create(null),
    connectionsCount = 0;

app.use(express.static('bin'));

server = http.Server(app);
io     = socket_io(server);

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

  socket.emit('assignnick',getConnectionsMapForID(id).nick);

  sendSystemAnnouncement(getConnectionsMapForID(id).nick + ' has joined.');
  sendUpdatedUsersList();

  socket.on('message', function (message) {
    //console.log(id, 'message:', message.username, message.message);
    //getConnectionsMapForID(id).messages.push(message.message);
    socket.broadcast.emit('message', {
      username: getConnectionsMapForID(id).nick,
      message : message.message
    });
  });

  socket.on('nickchange', function (nick) {
    var oldnick                     = getConnectionsMapForID(id).nick;
    getConnectionsMapForID(id).nick = nick;
    sendUpdatedUsersList();
    sendSystemAnnouncement(oldnick + ' changed nick to ' + nick + '.');
  });

  socket.on('disconnect', function () {
    console.log('disconnect');
    getConnectionsMapForID(id).connected = false;
    sendSystemAnnouncement(getConnectionsMapForID(id).nick + ' has left.');
    sendUpdatedUsersList();
    io.emit('user disconnected');
  });

  function sendUpdatedUsersList() {
    socket.emit('userupdate', getActiveUsersList());
  }

  function sendSystemAnnouncement(message) {
    io.emit('message', {
      username: 'System',
      message : message
    });
  }

});

server.listen(8080);