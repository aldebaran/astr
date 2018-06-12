(function($) {
  "use strict"; // Start of use strict

  if(isConnected()) {
    $.get('api/user/profile', function(user) {
      $('#personnal-info').html('' +
        '<p><span class="key">Name: </span><span class="value">' + user.name + '</span></p>' +
        '<p><span class="key">Email: </span><span class="value">' + user.email + '</span></p>' +
        '<p><span class="key">Write permission: </span><span class="value">' + user.write_permission + '</span></p>' +
        '<p><span class="key">Master: </span><span class="value">' + user.master + '</span></p>' +
        '<button class="btn btn-success" id="newToken">Generate a new token</button>'
      );
    });
  } else {
    $('#personnal-info').html('<p>You are not connected.</p>');
  }

  $('#myModal').on('click', '#copyToClipboard', function() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('#token').text()).select();
    document.execCommand("copy");
    $temp.remove();
    $('#modalCopyToClipboard').modal('show');

  });

  $('#personnal-info').on('click', '#newToken', function() {
    $.get('http://localhost:8000/api/user/newtoken/persistent', function(data) {
      if (data.key) {
        const date = new Date(data.expires);
        showModal('Success', 'Your new token is <strong id="token">' + data.key + '</strong><br>' +
        '<i>(expires the ' + date.toString().split(' ').slice(0, 4).join(' ') + ')</i><br>' +
        '<button class="btn btn-outline-success" id="copyToClipboard">Copy to clipboard</button><br>' +
        '<h2>Warning</h2><strong>You won\'t be able to see this token ever again because it has been encrypted in the database.<br></strong>Please store it in a file on your computer.');
      }
    });
  });

  // -------------------------- Functions -------------------------- //

  function isConnected() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = !user.error;
      }
    });
    return res;
  }

  function hasWritePermission() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user['write_permission'];
      }
    });
    return res;
  }

  function isMaster() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.master;
      }
    });
    return res;
  }

  function getUserName() {
    var res;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.name;
      }
    });
    return res;
  }

  function getMasterList() {
    var res = "";
    $.ajax({
      type: 'GET',
      url: 'api/user/master',
      async: false,
      success: function(masters) {
        masters.forEach(function(master) {
          res += master.firstname + ' ' + master.lastname + ': ' + master.email + '\n';
        });
      }
    });
    return res;
  }

  function showModal(title, message) {
    $('#myModal .modal-header').html('<h4 class="modal-title">' + title + '</h4>');
    $('#myModal .modal-body').html('<p>' + message + '<p>');
    $('#myModal').modal('show');
  }

})(jQuery); // End of use strict
