define('APP.View.MessageList',
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
  });