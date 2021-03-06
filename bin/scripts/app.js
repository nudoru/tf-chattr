define('APP.Application',
  function (require, module, exports) {

    var _this,
        _socketIO,
        _chattrEventConstants = require('App.Events.EventConstants'),
        _chattrEvents         = require('App.Events.EventCreator'),
        _dispatcher           = require('Nori.Utils.Dispatcher');

    function initialize() {
      var appModel, appView;

      _this = this;

      appModel = this.createApplicationModel(require('APP.Model.AppModel'));
      appView  = this.createApplicationView(require('APP.View.AppView'));

      this.initializeApplication({model: appModel, view: appView});

      _dispatcher.subscribe(_chattrEventConstants.PUBLISH_MESSAGE, handleMessagePublished);
      _dispatcher.subscribe(_chattrEventConstants.NICK_UPDATE, handleNickChange);
      _dispatcher.subscribe(_chattrEventConstants.USER_STARTTYPING, handleStartTyping);
      _dispatcher.subscribe(_chattrEventConstants.USER_ENDTYPING, handleEndTyping);

      this.view().initialize();
      this.model().initialize();

      // Could wait for model initialization to complete
      this.view().removeLoadingMessage();

      // Start it with the route in the URL
      this.setCurrentRoute(APP.router().getCurrentRoute());

      // moved down because default view is the app view
      this.view().render();

      _socketIO = io();
      _socketIO.on('message', handleMessageReceived);
      _socketIO.on('userupdate', handleUserUpdate);
      _socketIO.on('assignnick', handleAssignNick);
    }

    function handleMessagePublished(payload) {
      _socketIO.emit('message', {
        time: _this.model().prettyNow(),
        username: payload.payload.username,
        message : payload.payload.message
      });
    }

    function handleMessageReceived(message) {
      _this.model().addMessage(message.username, message.message);
    }

    function handleNickChange(payload) {
      _socketIO.emit('nickchange', payload.payload.nick);
    }

    function handleUserUpdate(users) {
      _this.model().setUsers(users);
    }

    function handleAssignNick(nick) {
      _this.view().setMyNick(nick);
      _this.model().setMyNick(nick);
    }

    function handleStartTyping() {
      _socketIO.emit('typingstart');
    }

    function handleEndTyping() {
      _socketIO.emit('typingend');
    }

    //----------------------------------------------------------------------------
    //  API
    //----------------------------------------------------------------------------

    exports.initialize = initialize;

  });;define('App.Events.EventConstants',
  function (require, module, exports) {
    var objUtils = require('Nudoru.Core.ObjectUtils');

    _.merge(exports, objUtils.keyMirror({
      PUBLISH_MESSAGE : null,
      NICK_UPDATE     : null,
      NICK_ASSIGNED   : null,
      USER_STARTTYPING: null,
      USER_ENDTYPING  : null
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

  });;define('APP.Model.AppModel',
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

    var _this,
        _appEvents         = require('Nori.Events.AppEventCreator'),
        _dispatcher        = require('Nori.Utils.Dispatcher'),
        _appEventConstants = require('Nori.Events.AppEventConstants'),
        _appEvents         = require('Nori.Events.AppEventCreator'),
        _chattrEvents      = require('App.Events.EventCreator');

    function initialize() {
      _this = this;

      _this.initializeApplicationView(['applicationscaffold', 'applicationcomponentsscaffold']);
      _this.setRouteViewMountPoint('#contents');

      configureApplicationViewEvents();

      APP.mapRouteView('/', 'default', 'APP.View.AppSubView');

      _appEvents.applicationViewInitialized();
    }

    function render() {
      _this.setEvents({
        'change #nick-input'    : handleNickInputChange,
        'change #message-input' : handleMessageInputChange,
        'focus #message-input'  : handleMessageInputFocus,
        'blur #message-input'   : handleMessageInputBlur,
        'keydown #message-input': handleMessageInputKeyPress
      });
      _this.delegateEvents();

      _this.createComponent('user-list', 'APP.View.UserList', '#users');
      _this.createComponent('message-list', 'APP.View.MessageList', '#message');
      _this.renderComponent('user-list');
      _this.renderComponent('message-list');
    }

    function handleNickInputChange(e) {
      _chattrEvents.updateNick(e.target.value);
    }

    function handleMessageInputFocus(e) {
      _chattrEvents.startTyping();
    }

    function handleMessageInputBlur(e) {
      _chattrEvents.endTyping();
    }

    function handleMessageInputKeyPress(e) {
      console.log('keying');
    }

    function handleMessageInputChange(e) {
      // Errors after this, can't send new messages
      //if(getMyNick() === '') {
      //  _this.alert('Set a nick before posting');
      //  return;
      //}
      _chattrEvents.publishMessage(getMyNick(), getMyMessageInput());
      clearMyMessageInput();
    }

    function getMyNick() {
      return document.getElementById('nick-input').value;
    }

    function setMyNick(nick) {
      document.getElementById('nick-input').value = nick;
    }

    function getMyMessageInput() {
      return document.getElementById('message-input').value;
    }

    function clearMyMessageInput() {
      return document.getElementById('message-input').value = '';
    }

    function configureApplicationViewEvents() {
      _dispatcher.subscribe(_appEventConstants.NOTIFY_USER, function (payload) {
        _this.notify(payload.payload.message, payload.payload.title, payload.payload.type);
      });

      _dispatcher.subscribe(_appEventConstants.ALERT_USER, function (payload) {
        _this.alert(payload.payload.message, payload.payload.title);
      });
    }

    exports.initialize = initialize;
    exports.setMyNick  = setMyNick;
    exports.render     = render;
  });;define('APP.View.MessageList',
  function (require, module, exports) {

    var _this;

    function initialize(initObj) {
      if (!this.isInitialized()) {
        _this = this;
        this.initializeSubView(initObj);
        APP.registerViewForModelChanges('MessagesCollection', this.getID());
      }
    }

    function viewWillUpdate() {
      var obj = Object.create(null);

      obj.messages = [];

      APP.model().getMessagesCollection().forEach(function (message) {
        var displayClass = '';

        if (message.get('username') === 'System') {
          displayClass = 'message__list-display-system';
        } else if (message.get('username') === APP.model().getMyNick()) {
          displayClass = 'message__list-display-me';
        }

        obj.messages.push({
          time    : message.get('time'),
          username: message.get('username'),
          content : message.get('content'),
          display : displayClass
        });
      });

      _this.setState(obj);
    }

    /**
     * After it's rendered to the screen, scroll to the bottom
     */
    function viewDidMount() {
      var container       = _this.getDOMElement().parentNode;
      container.scrollTop = container.scrollHeight;
    }

    exports.initialize     = initialize;
    exports.viewWillUpdate = viewWillUpdate;
    exports.viewDidMount   = viewDidMount;
  });;define('APP.View.UserList',
  function (require, module, exports) {

    var _this;

    function initialize(initObj) {
      if(!this.isInitialized()) {
        _this = this;
        this.initializeSubView(initObj);

        APP.registerViewForModelChanges('UsersCollection', this.getID());
      }
    }

    function viewWillUpdate() {
      var obj = Object.create(null);

      obj.users =  [];

      APP.model().getUsersCollection().forEach(function(user) {
        obj.users.push({
          username: user.get('username'),
          display: APP.model().getMyNick() === user.get('username') ? 'users__list-me' : '',
          status: '',
          typing: user.get('typing') ? 'users__list-typing' : ''
        });
      });
      _this.setState(obj);
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