(function($) {
  'use strict';

  if (isConnected() && isMaster()) {
    let auth = getAuthentification();

    $.get('api', function(app) {
      $('#application-info').html('' +
        '<p><span class="key">Application name: </span><span class="value">' + app.name + '</span>' +
        '<button class="btn btn-outline-info" id="buttonCustomName" data-toggle="modal" data-target="#modalCustomName"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Custom name</button></p>' +
        '<p><span class="key">A.S.T.R. running version: </span><span class="value">' + app.version + '</span></p>' +
        '<p><span class="key">Creation date: </span><span class="value">' + new Date(app.created).toLocaleString() + '</span></p>' +
        '<p><span class="key">Last reboot: </span><span class="value">' + new Date(app.lastBootUptime).toLocaleString() + '</span></p>'
      );
    });

    $('#formCustomName').submit(function(e) {
      e.preventDefault();
      var customName = $('#inputCustomName').val();
      if (customName.trim() !== '') {
        $.ajax({
          type: 'POST',
          url: 'api/change-app-name',
          headers: {'Authorization': 'Basic ' + btoa(auth)},
          data: {'name': customName},
          success: function(data) {
            console.log(data);
            location.reload();
          },
        });
      } else {
        showModal('Error', 'Name cannot be empty.');
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

  function showModal(title, message) {
    $('#myModal .modal-header').html('<h4 class="modal-title">' + title + '</h4>');
    $('#myModal .modal-body').html('<p>' + message + '<p>');
    $('#myModal').modal('show');
  }
})(jQuery);
