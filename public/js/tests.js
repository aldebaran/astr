(function($) {
  "use strict";

  $.get('api/tests', function(tests){
    if(isConnected() && isMaster()){
      //if the user is Master
      tests.forEach(function(test){
        $('#tests-grid').append('<div class="col-3"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '">id: ' + test['_id'] +
            '<button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
            '<button type="button" class="btn btn-info admin-user" id="editTest"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>' +
          '</div>' +
        '</div></div>');

        test.configuration.forEach(function(config){
          $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
        });
      })
    } else if (isConnected()){
      //if the user is connected but not a user --> can only modify his own tests
      const username = getUserName();
      tests.forEach(function(test){
        $('#tests-grid').append('<div class="col-3"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '">id: ' + test['_id'] +
          '</div>' +
        '</div></div>');

        test.configuration.forEach(function(config){
          $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
        });

        if(username === test.author) {
          $('#footer'+test['_id']).append(''+
          '<button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
          '<button type="button" class="btn btn-info admin-user" id="editTest"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>');
        }
      })
    } else {
      //if the user isn't logged
      tests.forEach(function(test){
        $('#tests-grid').append('<div class="col-3"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '">id: ' + test['_id'] +
          '</div>' +
        '</div></div>');

        test.configuration.forEach(function(config){
          $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
        });
      })
    }

    // buttons listener (edit & delete)
    $('#tests-grid').on('click', '#deleteTest', function(){
      var r = confirm('Please confirm that you want to delete this test.');
      if(r === true){
        $.ajax({
          method: 'DELETE',
          url: 'api/tests/' + $(this).parent().parent().attr('id'),
          success: function(data){
            location.reload();
          }
        })
      }
    })

  })

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
    })
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
    })
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
    })
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
    })
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
          res += master.firstname + ' ' + master.lastname + '\n';
        })
      }
    })
    return res;
  }

})(jQuery);
