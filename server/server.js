var socket_io        = require('socket.io'),
    http             = require('http'),
    express          = require('express'),
    app              = express(),
    moment          = require('moment'),
    server, io,
    connectionsMap   = Object.create(null),
    connectionsCount = 0;

app.use(express.static('bin'));

server = http.Server(app);
io     = socket_io(server);

function prettyNow() {
  return moment().format('h:mm a');
}

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
  var id = socket.id,
    ip = socket.request.connection.remoteAddress;

  //var clientIp = socket.request.connection.remoteAddress
  //https://github.com/socketio/socket.io/issues/1387

  console.log('Client connected', ip, id, prettyNow());

  addConnectionToMap(id);

  socket.emit('assignnick',getConnectionsMapForID(id).nick);

  sendSystemAnnouncement(getConnectionsMapForID(id).nick + ' ['+ip+'] has joined.');
  sendUpdatedUsersList();

  socket.on('message', function (message) {
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
    io.emit('userupdate', getActiveUsersList());
  }

  function sendSystemAnnouncement(message) {
    io.emit('message', {
      time: prettyNow(),
      username: 'System',
      message : message
    });
  }

});

server.listen(process.env.PORT || 8080);