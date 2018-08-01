(function($) {
  'use strict';

  if (isConnected()) {
    $.get('api/search', function(searches) {
      var count = 0;
      var user = getUserName();
      searches.forEach(function(search) {
        if (search.user === user) {
          count++;
          var link = 'explore.html?search=' + search._id;
          if (!search.archiveCategory) {
            search.archiveCategory = '<span class="null">ALL</span>';
          } else {
            search.archiveCategory = '<span class="key">' + search.archiveCategory + '</span>';
          }
          if (!search.archiveAuthor) {
            search.archiveAuthor = '<span class="null">ALL</span>';
          } else {
            search.archiveAuthor = '<span class="key">' + search.archiveAuthor + '</span>';
          }
          if (!search.date) {
            search.date = '<span class="null">ALL</span>';
          } else {
            search.date = '<span class="key">' + search.date + '</span>';
          }
          $('tbody').append('' +
          '<tr id="' + search._id + '" class="clickableRow" data-href="' + link + '">' +
            '<th scope="row">' + count + '</th>' +
            '<td>' + search.archiveCategory + '</td>' +
            '<td>' + search.archiveAuthor + '</td>' +
            '<td>' + search.date + '</td>' +
            '<td class="descriptors"></td>' +
            '<td class="ids"></td>' +
            '<td><a href="' + window.location.origin + '/' + link + '"><i class="fa fa-link" aria-hidden="true"></i> ' + link + '</a> <button class="btn btn-outline-success" id="copyToClipboard" style="float: right;  ">Copy to clipboard</button></td>' +
            '<td><button type="button" class="btn btn-danger admin-user" id="deleteSearch"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
          '</tr>');
          if (search.descriptors.length > 0) {
            search.descriptors.forEach(function(descriptor) {
              $('.descriptors:last').append('<div><span class="key">' + descriptor.name + ': </span><span class=value>' + descriptor.value + '</span></div>');
            });
          } else {
            $('.descriptors:last').html('<span class="null">ALL</span>');
          }
          if (search.ids.length > 0) {
            search.ids.forEach(function(id, index) {
              if (index !== search.ids.length - 1) {
                $('.ids:last').append('<div><span class="key">' + id + ',</span></div>');
              } else {
                $('.ids:last').append('<div><span class="key">' + id + '</span></div>');
              }
            });
          } else {
            $('.ids:last').html('<span class="null">ALL</span>');
          }
        }
      });
    });
  } else {
    // user not logged
    $('#mySearches').html('<p>Log in to see your saved searches.</p>');
  }

  $('table').on('click', '.clickableRow', function() {
    window.location.href = $(this).data('href');
  });

  $('table').on('click', '#deleteSearch', function(e) {
    e.stopPropagation();
    var r = confirm('Please confirm that you want to delete this search.');
    if (r === true) {
      $.ajax({
        type: 'DELETE',
        url: 'api/search/id/' + $(this).closest('tr').attr('id'),
        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
        success: function() {
          location.reload();
        },
      });
    }
  });

  $('table').on('click', '#copyToClipboard', function(e) {
    e.stopPropagation();
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val($(this).prev().attr('href')).select();
    document.execCommand('copy');
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
      },
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
