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

  });