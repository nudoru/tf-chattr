define('Nudoru.Component.MessageBoxCreator',
  function (require, module, exports) {

    var _messageBoxView = require('Nudoru.Component.MessageBoxView');

    function alert(title,message,modal) {
      return _messageBoxView.add({
        title: title,
        content: '<p>'+message+'</p>',
        type: _messageBoxView.type().DEFAULT,
        modal: modal,
        width: 400,
        buttons: [
          {
            label: 'Close',
            id: 'Close',
            type: 'default',
            icon: 'times'
          }
      ]
      })
    }

    function confirm(title, message, okCB, modal) {
      return _messageBoxView.add({
        title: title,
        content: '<p>'+message+'</p>',
        type: _messageBoxView.type().DEFAULT,
        modal: modal,
        width: 400,
        buttons: [
          {
            label: 'Cancel',
            id: 'Cancel',
            type: 'negative',
            icon: 'times'
          },
          {
            label: 'Proceed',
            id: 'proceed',
            type: 'positive',
            icon: 'check',
            onClick: okCB
          }
        ]
      });
    }

    function prompt(title, message, okCB, modal) {
      return _messageBoxView.add({
        title: title,
        content: '<p class="text-center padding-bottom-double">'+message+'</p><textarea name="response" class="input-text" type="text" style="width:400px; height:75px; resize: none" autofocus="true"></textarea>',
        type: _messageBoxView.type().DEFAULT,
        modal: modal,
        width: 450,
        buttons: [
          {
            label: 'Cancel',
            id: 'Cancel',
            type: 'negative',
            icon: 'times'
          },
          {
            label: 'Proceed',
            id: 'proceed',
            type: 'positive',
            icon: 'check',
            onClick: okCB
          }
        ]
      });
    }

    function choice(title, message, selections, okCB, modal) {
      var selectHTML = '<select class="spaced" style="width:450px;height:200px" name="selection" autofocus="true" size="20">';

        selections.forEach(function(opt) {
          selectHTML += '<option value="'+opt.value+'" '+(opt.selected==='true' ? 'selected' : '')+'>'+opt.label+'</option>';
        });

        selectHTML += '</select>';

      return _messageBoxView.add({
        title: title,
        content: '<p class="text-center padding-bottom-double">'+message+'</p><div class="text-center">'+selectHTML+'</div>',
        type: _messageBoxView.type().DEFAULT,
        modal: modal,
        width: 500,
        buttons: [
          {
            label: 'Cancel',
            id: 'Cancel',
            type: 'negative',
            icon: 'times'
          },
          {
            label: 'OK',
            id: 'ok',
            type: 'positive',
            icon: 'check',
            onClick: okCB
          }
        ]
      });
    }

    exports.alert = alert;
    exports.confirm = confirm;
    exports.prompt = prompt;
    exports.choice = choice;

  });