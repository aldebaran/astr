(function($) {
  "use strict";

  $.get('api/tests', function(tests){
    if(isConnected() && isMaster()){
      //if the user is Master
      tests.forEach(function(test){
        $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
            '<div id="button-footer"><button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
            '<button type="button" class="btn btn-info admin-user" id="editTest" data-toggle="modal" data-target="#myModal"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button></div>' +
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
        $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
          '</div>' +
        '</div></div>');

        test.configuration.forEach(function(config){
          $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
        });

        if(username === test.author) {
          $('#footer'+test['_id']).append('' +
          '<div id="button-footer"><button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
          '<button type="button" class="btn btn-info admin-user" id="editTest" data-toggle="modal" data-target="#myModal"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button></div>');
        }
      })
    } else {
      //if the user isn't logged
      tests.forEach(function(test){
        $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
          '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
          '<div class="card-body tests" id="body' + test['_id'] + '">' +
            '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
            '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '<span class="key">Location: </span><span class="value">' + test.location + '</span><br>' +
            '<span class="key">Configuration</span>' +
          '</div>' +
          '<div class="card-footer small text-muted" id="footer' + test['_id'] + '"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
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
          url: 'api/tests/' + $(this).parent().parent().parent().attr('id'),
          success: function(data){
            location.reload();
          }
        })
      }
    })

    // Edit a test
    $('#tests-grid').on('click', '#editTest', function(){
      $.get('api/tests/' + $(this).parent().parent().parent().attr('id'), function(test){
        $('.modal-body').html('' +
        '<div class="form-group">' +
          '<label for="inputDate">Date</label>' +
          '<input type="date" id="inputDate" max="2100-12-31" min="2010-01-01" class="form-control" value="' + test.date + '" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="inputLocation">Location</label>' +
          '<input type="text" id="inputLocation" class="form-control" value="' + test.location + '" required>' +
        '</div>'
        );
        test.configuration.forEach(function(config){
          $('.modal-body').append('' +
          '<div class="form-group">' +
            '<label for="inputConfig">' + config.name + '</label>' +
            '<input type="text" id="inputConfig" class="form-control inputConfig" value="' + config.value + '" name="' + config.name + '" required>' +
          '</div>'
          );
        })
        $('.modal-footer').html('' +
          '<input type="submit" value="Apply" class="btn btn-info" id="submit-edit">' +
          '<button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>'
        );
        $('form').attr('id', test['_id']);
      })
    })

    $('form').submit(function(e){
      e.preventDefault();
      var r = confirm('Please confirm that you want to modify this test.');
      if(r === true) {
        var okayToPush = true;
        var test = {
          date: $('#inputDate').val(),
          location: $('#inputLocation').val().trim(),
          configuration: [],
        };
        $('.inputConfig').each(function(){
          if($(this).val().trim() === ""){
            okayToPush = false;
          } else {
            test.configuration.push({
              name: $(this).attr('name'),
              value: $(this).val().trim()
            });
          }
        })

        if(okayToPush === true) {
          $.post('api/tests/' + $('form').attr('id'), test, function(data){
            //alert(JSON.stringify(data, null, 2));
            location.reload();
          });
        } else {
          alert("Your test was not added because you left an empty field.");
        }

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
