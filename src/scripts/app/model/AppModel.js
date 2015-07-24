define('APP.Model.AppModel',
  function (require, module, exports) {

    var _self,
        _appEvents  = require('Nori.Events.AppEventCreator'),
        _usersCollection,
        _messagesCollection,
        _dispatcher = require('Nori.Utils.Dispatcher');

    //----------------------------------------------------------------------------
    //  Init
    //----------------------------------------------------------------------------

    function initialize() {
      _self = this;

      _usersCollection = _self.createMapCollection({id:'UsersCollection'});
      _messagesCollection = _self.createMapCollection({id:'MessagesCollection'});

      _appEvents.applicationModelInitialized();
    }

    function addUser(username) {

    }

    function removeUser(username) {

    }

    function addMessage(username,message) {

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
    exports.addUser = addUser;
    exports.removeUser = removeUser;
    exports.addMessage = addMessage;
  });
