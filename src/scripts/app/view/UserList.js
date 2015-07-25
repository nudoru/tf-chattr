define('APP.View.UserList',
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
  });