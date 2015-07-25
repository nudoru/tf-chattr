define('APP.View.AppView',
  function (require, module, exports) {

    var _self,
        _appEvents = require('Nori.Events.AppEventCreator'),
        _dispatcher            = require('Nori.Utils.Dispatcher'),
        _appEventConstants     = require('Nori.Events.AppEventConstants'),
        _browserEventConstants = require('Nudoru.Browser.BrowserEventConstants');

    function initialize() {
      _self = this;

      _self.initializeApplicationView(['applicationscaffold', 'applicationcomponentsscaffold']);
      _self.setRouteViewMountPoint('#contents');

      configureApplicationViewEvents();

      APP.mapRouteView('/', 'default', 'APP.View.AppSubView');

      // For testing
      APP.mapRouteView('/styles', 'debug-styletest', 'APP.View.AppSubView');
      APP.mapRouteView('/controls', 'debug-controls', 'APP.View.AppSubView');
      APP.mapRouteView('/comps', 'debug-components', 'APP.View.DebugControlsTestingSubView');

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
      console.log('nickinput', e.target.value);
    }

    function handleMessageInputChange(e) {
      console.log('mesageinput', e.target.value);
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
  });