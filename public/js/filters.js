(function($) {
  "use strict";

  if(isConnected()) {
    $.get('api/filters', function(filters){
      var user = getUserName();
      filters.forEach(function(filter){
        if(filter.user === user) {
          var link = window.location.origin + '/tests/' + filter['_id'];
          if(!filter.testSubjectName){
            filter.testSubjectName = '<span class="null">NULL</span>';
          } else {
            filter.testSubjectName = '<span class="notNull">' + filter.testSubjectName + '</span>';
          }
          if(!filter.testAuthor){
            filter.testAuthor = '<span class="null">NULL</span>';
          } else {
            filter.testAuthor = '<span class="notNull">' + filter.testAuthor + '</span>';
          }
          if(!filter.date){
            filter.date = '<span class="null">NULL</span>';
          } else {
            filter.date = '<span class="notNull">' + filter.date + '</span>';
          }
          $('tbody').append('' +
          '<tr id="' + filter['_id'] + '">' +
            '<td>' + filter.testSubjectName + '</td>' +
            '<td>' + filter.testAuthor + '</td>' +
            '<td>' + filter.date + '</td>' +
            '<td class="config"></td>' +
            '<td><a href="' + link + '">' + link + '</a></td>' +
            '<td><button type="button" class="btn btn-danger admin-user" id="deleteFilter"><i class="fa fa-trash" aria-hidden="true"></i></button></td>' +
          '</tr>');
          if(filter.configuration.length > 0) {
            filter.configuration.forEach(function(config){
              $('.config:last').append('<span class="notNull">[' + config.name + ': ' + config.value + ']   </span>')
            });
          } else {
            $('.config:last').html('<span class="null">NULL</span>');
          }
        }
      });
    });
  } else {
    // user not logged
    $('#myFilters').html('<p>Log in to see your saved filters</p>');
  }

  $('table').on('click', '#deleteFilter', function(){
    var r = confirm('Please confirm that you want to delete this filter.');
    if(r === true){
      $.ajax({
        url: 'api/filters/id/' + $(this).closest('tr').attr('id'),
        type: 'DELETE',
        success: function(data){
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
        masters.forEach(function(master){
          res += master.firstname + ' ' + master.lastname + ': ' + master.email + '\n';
        });
      }
    });
    return res;
  }

})(jQuery);
