define('APP.Model.AppModel',
  function (require, module, exports) {

    var _self,
        _appEvents  = require('Nori.Events.AppEventCreator'),
        _usersCollection,
        _messagesCollection,
        _messageID = 1,
        _chattrEventConstants = require('App.Events.EventConstants'),
        _dispatcher = require('Nori.Utils.Dispatcher');

    //----------------------------------------------------------------------------
    //  Init
    //----------------------------------------------------------------------------

    function initialize() {
      _self = this;

      _dispatcher.subscribe(_chattrEventConstants.PUBLISH_MESSAGE, handleMessagePublished);

      _usersCollection = _self.createMapCollection({id:'UsersCollection'});
      _messagesCollection = _self.createMapCollection({id:'MessagesCollection'});

      addUser('Sophie');
      addUser('Gabe');
      addUser('Casey');
      addUser('Matt');

      addMessage('System','Welcome to Chattr! Start chatting...');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Casey','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');
      //addMessage('Matt','Testing!');

      _appEvents.applicationModelInitialized();
    }

    function getUsersCollection() {
      return _usersCollection;
    }

    function getMessagesCollection() {
      return _messagesCollection;
    }

    // escape user name
    function addUser(username) {
      _usersCollection.add(_self.createMap({id: username, store: {username: username}}));
    }

    function removeUser(username) {
      _usersCollection.remove(username);
    }

    // escape user name and message
    function addMessage(username,message) {
      username = username || 'Unknown';
      _messagesCollection.add(_self.createMap({id: _messageID++, store: {username: username, content: message}}));
    }

    function handleMessagePublished(payload) {
      addMessage(payload.payload.username, payload.payload.message);
    }

    //----------------------------------------------------------------------------
    //  Utility
    //----------------------------------------------------------------------------

    /**
     * Utility function
     * @param obj
     * @returns {*}
     */
    function getLocalStorageObject(obj) {
      return localStorage[obj];
    }

    //----------------------------------------------------------------------------
    //  API
    //----------------------------------------------------------------------------

    exports.initialize = initialize;
    exports.getUsersCollection = getUsersCollection;
    exports.getMessagesCollection = getMessagesCollection;
    exports.addUser = addUser;
    exports.removeUser = removeUser;
    exports.addMessage = addMessage;
  });
