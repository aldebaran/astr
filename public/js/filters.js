(function($) {
  "use strict";

  if(isConnected()) {
    $.get('api/filters', function(filters) {
      var count = 0;
      var user = getUserName();
      filters.forEach(function(filter) {
        if(filter.user === user) {
          count++;
          var link = window.location.origin + '/tests.html?filter=' + filter['_id'];
          if(!filter.testSubjectName) {
            filter.testSubjectName = '<span class="null">ALL</span>';
          } else {
            filter.testSubjectName = '<span class="key">' + filter.testSubjectName + '</span>';
          }
          if(!filter.testAuthor) {
            filter.testAuthor = '<span class="null">ALL</span>';
          } else {
            filter.testAuthor = '<span class="key">' + filter.testAuthor + '</span>';
          }
          if(!filter.date) {
            filter.date = '<span class="null">ALL</span>';
          } else {
            filter.date = '<span class="key">' + filter.date + '</span>';
          }
          $('tbody').append('' +
          '<tr id="' + filter['_id'] + '">' +
            '<th scope="row">' + count + '</th>' +
            '<td>' + filter.testSubjectName + '</td>' +
            '<td>' + filter.testAuthor + '</td>' +
            '<td>' + filter.date + '</td>' +
            '<td class="config"></td>' +
            '<td><a href="' + link + '">' + link + '</a> <button class="btn btn-outline-success" id="copyToClipboard" style="float: right;  ">Copy to clipboard</button></td>' +
            '<td><button type="button" class="btn btn-danger admin-user" id="deleteFilter"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
          '</tr>');
          if(filter.configuration.length > 0) {
            filter.configuration.forEach(function(config) {
              $('.config:last').append('<div><span class="key">' + config.name + ': </span><span class=value>' + config.value + '</span></div>')
            });
          } else {
            $('.config:last').html('<span class="null">ALL</span>');
          }
        }
      });
    });
  } else {
    // user not logged
    $('#myFilters').html('<p>Log in to see your saved searches.</p>');
  }

  $('table').on('click', '#deleteFilter', function() {
    var r = confirm('Please confirm that you want to delete this filter.');
    if(r === true) {
      $.ajax({
        type: 'DELETE',
        url: 'api/filters/id/' + $(this).closest('tr').attr('id'),
        headers: {"Authorization": "Basic " + btoa(getAuthentification())},
        success: function() {
          location.reload();
        }
      });
    }
  });

  $('table').on('click', '#copyToClipboard', function() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(this).prev().attr('href')).select();
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

})(jQuery);
