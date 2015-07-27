define('APP.View.UserList',
  function (require, module, exports) {

    var _self;

    function initialize(initObj) {
      if(!this.isInitialized()) {
        _self = this;
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
          display: APP.model().getMyNick() === user.get('username') ? 'users__list-me' : ''
        });
      });
      _self.setState(obj);
    }

    exports.initialize = initialize;
    exports.viewWillUpdate = viewWillUpdate;
  });