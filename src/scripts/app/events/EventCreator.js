define('App.Events.EventCreator',
  function (require, module, exports) {

    var _dispatcher     = require('Nori.Utils.Dispatcher'),
        _eventConstants = require('App.Events.EventConstants');

    exports.publishMessage = function (username, message) {
      _dispatcher.publish({
        type   : _eventConstants.PUBLISH_MESSAGE,
        payload: {
          username: username,
          message : message
        }
      });
    };

    exports.updateNick = function (nick) {
      _dispatcher.publish({
        type   : _eventConstants.NICK_UPDATE,
        payload: {
          nick: nick
        }
      });
    };

    exports.startTyping = function () {
      _dispatcher.publish({
        type   : _eventConstants.USER_STARTTYPING,
        payload: {}
      });
    };

    exports.endTyping = function () {
      _dispatcher.publish({
        type   : _eventConstants.USER_ENDTYPING,
        payload: {}
      });
    };

  });