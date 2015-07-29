define('APP.View.AppView',
  function (require, module, exports) {

    var _self,
        _appEvents         = require('Nori.Events.AppEventCreator'),
        _dispatcher        = require('Nori.Utils.Dispatcher'),
        _appEventConstants = require('Nori.Events.AppEventConstants'),
        _appEvents         = require('Nori.Events.AppEventCreator'),
        _chattrEvents      = require('App.Events.EventCreator');

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
        'change #nick-input'    : handleNickInputChange,
        'change #message-input' : handleMessageInputChange,
        'focus #message-input'  : handleMessageInputFocus,
        'blur #message-input'   : handleMessageInputBlur,
        'keydown #message-input': handleMessageInputKeyPress
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
      //  _self.alert('Set a nick before posting');
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
        _self.notify(payload.payload.message, payload.payload.title, payload.payload.type);
      });

      _dispatcher.subscribe(_appEventConstants.ALERT_USER, function (payload) {
        _self.alert(payload.payload.message, payload.payload.title);
      });
    }

    exports.initialize = initialize;
    exports.setMyNick  = setMyNick;
    exports.render     = render;
  });