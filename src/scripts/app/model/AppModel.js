define('APP.Model.AppModel',
  function (require, module, exports) {

    var _this,
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
      _this = this;

      _dispatcher.subscribe(_chattrEventConstants.PUBLISH_MESSAGE, handleMessagePublished);
      _dispatcher.subscribe(_chattrEventConstants.NICK_UPDATE, handleNickChange);

      _usersCollection    = _this.createMapCollection({id: 'UsersCollection'});
      _messagesCollection = _this.createMapCollection({id: 'MessagesCollection'});

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

    function addUser(userObj) {
      if (!userObj) {
        return;
      }
      _usersCollection.add(_this.createMap({
        id   : userObj.id,
        store: {
          username: userObj.nick,
          status  : userObj.status,
          typing  : userObj.typing
        }
      }));
    }

    function removeUser(username) {
      _usersCollection.remove(username);
    }

    // escape user name and message
    function addMessage(username, message) {
      console.log('model, addMessage');
      username = username || 'Unknown';
      _messagesCollection.add(_this.createMap({
        id   : _messageID++,
        store: {
          time    : prettyNow(),
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

    function prettyNow() {
      return moment().format('h:mm a');
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
    exports.prettyNow             = prettyNow;
  });
