(function($) {
  "use strict"; // Start of use strict

  if(isConnected()) {
    // display personnal information
    $.get('api/user/profile', function(user) {
      $('#personnal-info .card-body').html('' +
        '<p><span class="key">Name: </span><span class="value">' + user.name + '</span></p>' +
        '<p><span class="key">Email: </span><span class="value">' + user.email + '</span></p>' +
        '<p><span class="key">Write permission: </span><span class="value">' + user.write_permission + '</span></p>' +
        '<p><span class="key">Master: </span><span class="value">' + user.master + '</span></p>' +
        '<button class="btn btn-success" id="newToken" data-toggle="modal" data-target="#myModal">Generate a new token</button>'
      );

      // dispay tokens
      if (user.tokens.length - 1 > 0) { // -1 because we don't want the session-token
        $('#tokens-list').css('display', 'block');
        var count = 0;
        user.tokens.forEach(function(token) {
          if (token.name != 'session') {
            count++;
            $('tbody').append('' +
            '<tr id="' + token._id + '">' +
              '<th scope="row">' + count + '</th>' +
              '<td>' + token.name + '</td>' +
              '<td>' + new Date(token.expires).toString().split(' ').splice(0,4).join(' ') + '</td>' +
              '<td><button type="button" class="btn btn-danger admin-user" id="deleteToken"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
            '</tr>');
          }
        });
      }
    });
  } else {
    $('#personnal-info').html('<p>You are not connected.</p>');
  }

  // copy to clipboard button
  $('#myModal').on('click', '#copyToClipboard', function() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('#token').text()).select();
    document.execCommand("copy");
    $temp.remove();
    $('#modalCopyToClipboard').modal('show');
  });

  // create a new token
  $('#myModal').on('submit', '#formNewToken', function(e) {
    e.preventDefault();
    $.get('http://localhost:8000/api/user/newtoken/persistent/' + $('#inputTokenName').val().trim(), function(data) {
      if (data.key) {
        const date = new Date(data.expires);
        showModal('Success', 'Your new token is <strong id="token">' + data.key + '</strong><br>' +
        '<i>(expires ' + date.toString().split(' ').slice(0, 4).join(' ') + ')</i><br><br>' +
        '<button class="btn btn-outline-success" id="copyToClipboard">Copy to clipboard</button><br><br>' +
        '<h2>Warning</h2><strong>You won\'t be able to see this token ever again because it has been encrypted in the database.<br></strong>Please store it in a file on your computer.<br>');
        $('#myModal .modal-footer').html('<a class="btn btn-primary" href="profile.html">Close</a>')
      }
    });
  });

  // delete tokens
  $('#tokens-list').on('click', '#deleteToken', function() {
    var r = confirm('Please confirm that you want to delete this token.');
    if(r === true) {
      $.ajax({
        method: 'DELETE',
        url: 'api/user/deletetoken/' + $(this).closest('tr').attr('id'),
        headers: {"Authorization": "Basic " + btoa(getAuthentification())},
        success: function() {
          location.reload();
        }
      });
    }
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

  function getAuthentification() {
    var res;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.email + ':' + getCookie('session-token');
      }
    });
    return res;
  }

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

})(jQuery); // End of use strict
