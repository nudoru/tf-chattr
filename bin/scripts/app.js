define('APP.Application',
  function (require, module, exports) {

    var _self;

    function initialize() {
      var appModel, appView;

      _self = this;

      appModel = this.createApplicationModel(require('APP.Model.AppModel'));
      appView = this.createApplicationView(require('APP.View.AppView'));

      this.initializeApplication({model:appModel, view:appView});

      this.view().initialize();
      this.model().initialize();

      // Could wait for model initialization to complete
      this.view().removeLoadingMessage();

      // Start it with the route in the URL
      this.setCurrentRoute(APP.router().getCurrentRoute());

      // moved down because default view is the app view
      this.view().render();
    }

    //----------------------------------------------------------------------------
    //  API
    //----------------------------------------------------------------------------

    exports.initialize = initialize;

  });;define('App.Events.EventConstants',
  function (require, module, exports) {
    var objUtils = require('Nudoru.Core.ObjectUtils');

    _.merge(exports, objUtils.keyMirror({
      PUBLISH_MESSAGE: null,
      NICK_UPDATE    : null
    }));
  });;define('App.Events.EventCreator',
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

  });;define('APP.Model.AppModel',
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
;define('APP.View.AppSubView',
  function (require, module, exports) {

    function initialize(initObj) {
      if(!this.isInitialized()) {
        // associate with stores

        this.initializeSubView(initObj);
      }
    }

    function viewWillUpdate() {
      // Update state from stores
    }

    // Example of custom render
    //function render() {
    //  this.viewWillRender();
    //  this.setHTML(this.getTemplate()(this.getState()));
    //  // created in mount this.setDOMElement(_domUtils.HTMLStrToNode(this.getHTML()));
    //  this.viewDidRender();
    //}

    //function viewDidMount() {
    //  // good place to assign events or post render
    //}
    //
    //function viewWillUnmount() {
    //  // remove events
    //}

    exports.initialize = initialize;
    exports.viewWillUpdate = viewWillUpdate;

    //exports.viewDidUpdate = viewDidUpdate;
    //exports.viewWillRender = viewWillRender;
    //exports.viewDidRender = viewDidRender;
    //exports.viewWillMount = viewWillMount;
    //exports.viewDidMount = viewDidMount;
    //exports.viewWillUnmount = viewWillUnmount;
    //exports.viewDidUnmount = viewDidUnmount;
  });;define('APP.View.AppView',
  function (require, module, exports) {

    var _self,
        _appEvents = require('Nori.Events.AppEventCreator'),
        _dispatcher            = require('Nori.Utils.Dispatcher'),
        _appEventConstants     = require('Nori.Events.AppEventConstants'),
        _chattrEvents         = require('App.Events.EventCreator'),
        _browserEventConstants = require('Nudoru.Browser.BrowserEventConstants');

    function initialize() {
      _self = this;

      _self.initializeApplicationView(['applicationscaffold', 'applicationcomponentsscaffold']);
      _self.setRouteViewMountPoint('#contents');

      configureApplicationViewEvents();

      APP.mapRouteView('/', 'default', 'APP.View.AppSubView');

      _appEvents.applicationViewInitialized();
    }

    function render() {
      _self.setEvents({
        'change #nick-input'   : handleNickInputChange,
        'change #message-input': handleMessageInputChange
      });
      _self.delegateEvents();

      _self.createComponent('user-list', 'APP.View.UserList', '#users');
      _self.createComponent('message-list', 'APP.View.MessageList', '#message');

      _self.renderComponent('user-list');
      _self.renderComponent('message-list');
    }

    function handleNickInputChange(e) {
      _chattrEvents.updateNick(e.target.value);
    }

    function handleMessageInputChange(e) {
      _chattrEvents.publishMessage(getMyNick(), getMyMessageInput());
      clearMyMessageInput();
    }

    function getMyNick() {
      return document.getElementById('nick-input').value;
    }

    function getMyMessageInput() {
      return document.getElementById('message-input').value;
    }

    function clearMyMessageInput() {
      return document.getElementById('message-input').value = '';
    }

    function configureApplicationViewEvents() {
      _dispatcher.subscribe(_appEventConstants.NOTIFY_USER, function (payload) {
        _self.notify(payload.payload.message, payload.payload.title, payload.payload.type);
      });

      _dispatcher.subscribe(_appEventConstants.ALERT_USER, function (payload) {
        _self.alert(payload.payload.message, payload.payload.title);
      });
    }

    exports.initialize = initialize;
    exports.render     = render;
  });;define('APP.View.MessageList',
  function (require, module, exports) {

    var _self;

    function initialize(initObj) {
      if(!this.isInitialized()) {
        _self = this;
        this.initializeSubView(initObj);
        APP.registerViewForModelChanges('MessagesCollection', this.getID());
      }
    }

    function viewWillUpdate() {
      var obj = Object.create(null);

      obj.messages =  [];

      APP.model().getMessagesCollection().forEach(function(message) {
        obj.messages.push({
          username: message.get('username'),
          content: message.get('content')
        });
      });

      _self.setState(obj);
    }

    /**
     * After it's rendered to the screen, scroll to the bottom
     */
    function viewDidMount() {
      var container = _self.getDOMElement().parentNode;
      container.scrollTop = container.scrollHeight;
    }

    exports.initialize = initialize;
    exports.viewWillUpdate = viewWillUpdate;
    exports.viewDidMount = viewDidMount;
  });;define('APP.View.UserList',
  function (require, module, exports) {

    var _self;

    function initialize(initObj) {
      if(!this.isInitialized()) {
        _self = this;
        APP.registerViewForModelChanges('UsersCollection', this.getID());
        this.initializeSubView(initObj);
      }
    }

    function viewWillUpdate() {
      var obj = Object.create(null);

      obj.users =  [];

      APP.model().getUsersCollection().forEach(function(user) {
        obj.users.push(user.get('username'));
      });
      _self.setState(obj);
    }

    exports.initialize = initialize;
    exports.viewWillUpdate = viewWillUpdate;
  });;(function () {

  var _browserInfo = require('Nudoru.Browser.BrowserInfo');

  if(_browserInfo.notSupported || _browserInfo.isIE9) {
    // Lock out older browsers
    document.querySelector('body').innerHTML = '<h3>For the best experience, please use Internet Explorer 10+, Firefox, Chrome or Safari to view this application.</h3>';
  } else {
    // Initialize the window
    window.onload = function() {

      // Create the application instance
      window.APP = Nori.createApplication(require('APP.Application'));

      // Kick off the bootstrapping process
      APP.initialize();

    };
  }

}());