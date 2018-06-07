(function($) {
  "use strict"; // Start of use strict

  if(isConnected()) {
    $.get('api/user/profile', function(user) {
      $('#personnal-info').html('' +
        '<p><span class="key">Name: </span><span class="value">' + user.name + '</span></p>' +
        '<p><span class="key">Email: </span><span class="value">' + user.email + '</span></p>' +
        '<p><span class="key">API Token: </span><span class="value" id="token">' + user.token + '</span> <button class="btn btn-outline-success" id="copyToClipboard">Copy to clipboard</button></p>' +
        '<p><span class="key">Write permission: </span><span class="value">' + user.write_permission + '</span></p>' +
        '<p><span class="key">Master: </span><span class="value">' + user.master + '</span></p>'
      );
    });
  } else {
    $('#personnal-info').html('<p>You are not connected.</p>');
  }

  $('#personnal-info').on('click', '#copyToClipboard', function() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('#token').text()).select();
    document.execCommand("copy");
    $temp.remove();
    $('#myModal').modal('show');
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

})(jQuery); // End of use strict
