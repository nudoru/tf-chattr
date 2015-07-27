define('App.Events.EventConstants',
  function (require, module, exports) {
    var objUtils = require('Nudoru.Core.ObjectUtils');

    _.merge(exports, objUtils.keyMirror({
      PUBLISH_MESSAGE: null,
      NICK_UPDATE    : null,
      NICK_ASSIGNED  : null
    }));
  });