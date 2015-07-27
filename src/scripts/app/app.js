define('APP.Application',
  function (require, module, exports) {

    var _self,
        _socketIO,
        _chattrEventConstants = require('App.Events.EventConstants'),
        _chattrEvents         = require('App.Events.EventCreator'),
        _dispatcher           = require('Nori.Utils.Dispatcher');

    function initialize() {
      var appModel, appView;

      _self = this;

      appModel = this.createApplicationModel(require('APP.Model.AppModel'));
      appView  = this.createApplicationView(require('APP.View.AppView'));

      this.initializeApplication({model: appModel, view: appView});

      _dispatcher.subscribe(_chattrEventConstants.PUBLISH_MESSAGE, handleMessagePublished);
      _dispatcher.subscribe(_chattrEventConstants.NICK_UPDATE, handleNickChange);

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
    }

    function handleMessagePublished(payload) {
      console.log('controller, handleMessagePublished, socket EMITTING');
      _socketIO.emit('message', {
        username: payload.payload.username,
        message : payload.payload.message
      });
    }

    function handleMessageReceived(message) {
      console.log('controller handleMessageRecieved:', message);
      _self.model().addMessage(message.username, message.message);
    }

    function handleNickChange(payload) {
      _socketIO.emit('nickchange', payload.payload.nick);
    }

    function handleUserUpdate(users) {
      console.log('server user: ', users);
      _self.model().setUsers(users);
    }

    //----------------------------------------------------------------------------
    //  API
    //----------------------------------------------------------------------------

    exports.initialize = initialize;

  });