(function($) {
  'use strict';

  if (isConnected() && isMaster()) {
    let auth = getAuthentification();

    $.get('api/user', function(users) {
      // fillout the table with users
      users.forEach(function(user) {
        if (user.master === true) {
          $('tbody').append('' +
          '<tr value="' + user._id + '">' +
            '<td>' + user.firstname + '</td>'+
            '<td>' + user.lastname + '</td>' +
            '<td>' + user.email + '</td>' +
            '<td id="write_permission'+user._id+'">' + user.write_permission.toString().replace('true', 'YES').replace('false', 'NO') + '</td>' +
            '<td id="master'+user._id+'">' + user.master.toString().replace('true', 'YES').replace('false', 'NO') + '<button type="button" class="btn btn-outline-info admin-user" id="modifyMaster">Modify master status</button></td>' +
            '<td><button type="button" class="btn btn-danger admin-user" id="deleteUser"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
          '</tr>');
        } else {
          $('tbody').append('' +
          '<tr value="' + user._id + '">' +
            '<td>' + user.firstname + '</td>'+
            '<td>' + user.lastname + '</td>' +
            '<td>' + user.email + '</td>' +
            '<td id="write_permission'+user._id+'">' + user.write_permission.toString().replace('true', 'YES').replace('false', 'NO') + '<button type="button" class="btn btn-outline-info admin-user" id="modifyWritePermission">Modify write permission</button></td>' +
            '<td id="master'+user._id+'">' + user.master.toString().replace('true', 'YES').replace('false', 'NO') + '<button type="button" class="btn btn-outline-info admin-user" id="modifyMaster">Modify master status</button></td>' +
            '<td><button type="button" class="btn btn-danger admin-user" id="deleteUser"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
          '</tr>');
        }

        if (user.write_permission === true) {
          $('#write_permission'+user._id).css('color', 'green');
        } else {
          $('#write_permission'+user._id).css('color', 'red');
        }
        if (user.master === true) {
          $('#master'+user._id).css('color', 'green');
        } else {
          $('#master'+user._id).css('color', 'red');
        }
      });
    });

    // modify and delete buttons
    $('tbody').on('click', '#modifyWritePermission', function() {
      var r = confirm('Please confirm that you want to modify the write permission of this user.');
      if (r === true) {
        $.ajax({
          type: 'POST',
          url: 'api/user/id/' + $(this).parent().parent().attr('value'),
          headers: {'Authorization': 'Basic ' + btoa(auth)},
          data: {'write_permission': !$(this).parent().html().includes('YES')},
          success: function() {
            location.reload();
          },
        });
      }
    });
    $('tbody').on('click', '#modifyMaster', function() {
      var r = confirm('Please confirm that you want to modify the master status of this user.');
      if (r === true) {
        $.ajax({
          type: 'POST',
          url: 'api/user/id/' + $(this).parent().parent().attr('value'),
          headers: {'Authorization': 'Basic ' + btoa(auth)},
          data: {'master': !$(this).parent().html().includes('YES')},
          success: function() {
            location.reload();
          },
        });
      }
    });
    $('tbody').on('click', '#deleteUser', function() {
      var r = confirm('Please confirm that you want to delete this user.');
      if (r === true) {
        $.ajax({
          type: 'DELETE',
          url: 'api/user/id/' + $(this).parent().parent().attr('value'),
          headers: {'Authorization': 'Basic ' + btoa(auth)},
          success: function() {
            location.reload();
          },
        });
      }
    });
  } else {
    // user not logged or not master
    $('body').html('<pre style="color: white;">Well tried but you\'re not a master!</pre>');
  }


  // -------------------------- Functions -------------------------- //

  function isConnected() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = !user.error;
      },
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
      },
    });
    return res;
  }

  function getAuthentification() {
    var res;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.email + ':' + getCookie('session-token');
      },
    });
    return res;
  }

  function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
  }
})(jQuery);
