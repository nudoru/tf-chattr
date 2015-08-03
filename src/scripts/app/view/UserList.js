define('APP.View.UserList',
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
  });