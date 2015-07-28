define('APP.View.MessageList',
  function (require, module, exports) {

    var _self;

    function initialize(initObj) {
      if (!this.isInitialized()) {
        _self = this;
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

      _self.setState(obj);
    }

    /**
     * After it's rendered to the screen, scroll to the bottom
     */
    function viewDidMount() {
      var container       = _self.getDOMElement().parentNode;
      container.scrollTop = container.scrollHeight;
    }

    exports.initialize     = initialize;
    exports.viewWillUpdate = viewWillUpdate;
    exports.viewDidMount   = viewDidMount;
  });