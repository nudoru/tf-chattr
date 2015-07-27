define('APP.Model.AppModel',
  function (require, module, exports) {

    var _self,
        _myNick,
        _appEvents            = require('Nori.Events.AppEventCreator'),
        _usersCollection,
        _messagesCollection,
        _messageID            = 1,
        _chattrEventConstants = require('App.Events.EventConstants'),
        _dispatcher           = require('Nori.Utils.Dispatcher');

    //----------------------------------------------------------------------------
    //  Init
    //----------------------------------------------------------------------------

    function initialize() {
      _self = this;

      _dispatcher.subscribe(_chattrEventConstants.PUBLISH_MESSAGE, handleMessagePublished);
      _dispatcher.subscribe(_chattrEventConstants.NICK_UPDATE, handleNickChange);

      _usersCollection    = _self.createMapCollection({id: 'UsersCollection'});
      _messagesCollection = _self.createMapCollection({id: 'MessagesCollection'});

      //addUser('Sophie');
      //addUser('Gabe');
      //addUser('Casey');
      //addUser('Matt');

      _appEvents.applicationModelInitialized();
    }

    function getUsersCollection() {
      return _usersCollection;
    }

    function getMessagesCollection() {
      return _messagesCollection;
    }

    function getMyNick() {
      return _myNick;
    }

    function setMyNick(nick) {
      _myNick = nick;
    }

    function setUsers(users) {
      _usersCollection.removeAll();
      users.forEach(function (user) {
        addUser(user);
      });
    }

    function addUser(username) {
      if(!username) {
        return;
      }
      _usersCollection.add(_self.createMap({
        id   : username,
        store: {username: username}
      }));
    }

    function removeUser(username) {
      _usersCollection.remove(username);
    }

    // escape user name and message
    function addMessage(username, message) {
      console.log('model, addMessage');
      username = username || 'Unknown';
      _messagesCollection.add(_self.createMap({
        id   : _messageID++,
        store: {
          username: username,
          content : message
        }
      }));
    }

    function handleMessagePublished(payload) {
      console.log('model, handleMessagePublished');
      addMessage(payload.payload.username, payload.payload.message);
    }

    function handleNickChange(payload) {
      _myNick = payload.payload.nick;
    }

    //----------------------------------------------------------------------------
    //  API
    //----------------------------------------------------------------------------

    exports.initialize            = initialize;
    exports.getUsersCollection    = getUsersCollection;
    exports.getMessagesCollection = getMessagesCollection;
    exports.setUsers              = setUsers;
    exports.addUser               = addUser;
    exports.removeUser            = removeUser;
    exports.addMessage            = addMessage;
    exports.getMyNick             = getMyNick;
    exports.setMyNick             = setMyNick;
  });
