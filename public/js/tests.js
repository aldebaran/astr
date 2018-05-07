(function($) {
  "use strict";

  //Search
  //get all test authors
  $.get('api/tests/authors', function(authors){
    authors.forEach(function(author){
      $('#selectAuthor').append('<option>' + author + '</option>');
    })
  });
  //get all test subjects
  $.get('api/tests/subjects', function(subjects){
    subjects.forEach(function(subject){
      $('#selectSubject').append('<option>' + subject + '</option>');
    })
  });
  //get all test configuration
  $.get('api/tests/configurations', function(configurations){
    configurations.forEach(function(config){
      $('#selectConfig').append('<option>' + config + '</option>');
    })
  });

  // search
  $('#form-search').change(function(){
    //create the body request
    var bodyRequest = {
      '$and': []
    };
    //add the author to the body request
    if($('#selectAuthor').val() !== 'default') {
      bodyRequest.author = $('#selectAuthor').val();
    }
    //add the test subject to the body request
    if($('#selectSubject').val() !== 'default') {
      bodyRequest.type = $('#selectSubject').val();
    }
    //add the date to the body request
    if($('#inputDate').val() !== '') {
      bodyRequest.date = $('#inputDate').val();
    }
    //add the configuration to the body request
    $('.inputConfig').each(function(){
      if($(this).val() !== ''){
        bodyRequest['$and'].push({
          "configuration": {
            "$elemMatch": {
              "name": $(this).closest('.form-group').find('label').html(),
              "value": $(this).val()
            }
          }
        })
      }
    })

    //execute the search each time the box search content change
    search(bodyRequest);
  })

  $('#selectSubject').change(function(){
    if($('#selectSubject').val() !== 'default') {
      //select only the configuration of the test subject
      $.get('api/tests/configurations/' + $('#selectSubject').val(), function(configurations){
        $('#selectConfig').html('<option value="default"></option>');
        configurations.forEach(function(config){
          $('#selectConfig').append('<option>' + config + '</option>');
        })
      });
    } else {
      $.get('api/tests/configurations', function(configurations){
        $('#selectConfig').html('<option value="default"></option>');
        configurations.forEach(function(config){
          $('#selectConfig').append('<option>' + config + '</option>');
        })
      });
    }

    //delete existing configuration
    $('.config-group').each(function(){
      $(this).remove();
    })
    selectedConfig = [];
  })

  $('#form-search').submit(function(e){
    e.preventDefault();
  })

  //add input when a new configuration is selected
  var selectedConfig = [];
  $('#selectConfig').change(function(){
    if($('#selectConfig').val() !== 'default' && !selectedConfig.includes($('#selectConfig').val())){
      selectedConfig.push($('#selectConfig').val());
      $('#form-search').append('' +
      '<div class="form-group config-group">' +
        '<label class="labelConfig">' + $('#selectConfig').val() + '</label>' +
        '<div class="row">' +
          '<div class="col">' +
            '<select class="form-control inputConfig">' +
              '<option></option>' +
            '</select>' +
          '</div>' +
          '<div class="col-2">' +
            '<button type="button" class="btn btn-warning deleteConfig" id="deleteConfig"><i class="fa fa-times" aria-hidden="true"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>'
      );
      $.get('/api/tests/options/' + $('#selectConfig').val(), function(options){
        options.forEach(function(option){
          $('.inputConfig:last').append('<option>' + option + '</option>')
        })
      })
    }
  })

  //delete config input
  $('#form-search').on('click', '.deleteConfig', function(){
    //remove config from the array
    selectedConfig.splice(selectedConfig.indexOf($(this).closest('.form-group').find('label').html()), 1);
    //remove config input from the page
    $(this).closest('.form-group').remove();
    $('#form-search').trigger('change');
  })

  function search(body) {
    $.post('api/tests', body, function(tests){
      var matchedTests = [];
      $('#tests-grid').html('');
      if(isConnected() && isMaster()){
        //if the user is Master
        tests.forEach(function(test){
          matchedTests.push(test['_id']);
          $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
            '<div class="card-header">'+ test.type + '</div>' +
            '<div class="card-body tests" id="body' + test['_id'] + '">' +
              '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
              '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '</div>' +
            '<div class="card-footer small text-muted" id="footer' + test['_id'] + '"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + test['_id'] + '">' +
                '<button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
                '<button type="button" class="btn btn-info admin-user" id="editTest" data-toggle="modal" data-target="#myModal"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + test['_id'] + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          test.configuration.forEach(function(config){
            $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
          });
        })
      } else if (isConnected()){
        //if the user is connected but not a master --> can only modify his own tests
        const username = getUserName();
        tests.forEach(function(test){
          matchedTests.push(test['_id']);
          $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
            '<div class="card-header">'+ test.type + '</div>' +
            '<div class="card-body tests" id="body' + test['_id'] + '">' +
              '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
              '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '</div>' +
            '<div class="card-footer small text-muted"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + test['_id'] + '">' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + test['_id'] + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          test.configuration.forEach(function(config){
            $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
          });

          if(username === test.author) {
            $('#button-footer'+test['_id']).html('' +
            '<button type="button" class="btn btn-danger admin-user" id="deleteTest"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
            '<button type="button" class="btn btn-info admin-user" id="editTest" data-toggle="modal" data-target="#myModal"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>' +
            '<a class="btn btn-success download-button" href="/api/download/id/' + test['_id'] + '"><i class="fa fa-download" aria-hidden="true"></i></a>');
          }
        })
      } else {
        //if the user isn't logged
        tests.forEach(function(test){
          matchedTests.push(test['_id']);
          $('#tests-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + test['_id'] + '">' +
            '<div class="card-header">'+ test.type + '</div>' +
            '<div class="card-body tests" id="body' + test['_id'] + '">' +
              '<span class="key">Author: </span><span class="value">' + test.author + '</span><br>' +
              '<span class="key">Date: </span><span class="value">' + test.date + '</span><br>' +
            '</div>' +
            '<div class="card-footer small text-muted" id="footer' + test['_id'] + '"><div id="info-footer">id: ' + test['_id'] + '<br> last modification: ' + new Date(test.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + test['_id'] + '">' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + test['_id'] + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          test.configuration.forEach(function(config){
            $('#body'+test['_id']).append('<li class="config"><span class="configName">' + config.name + ':</span><span class="value"> ' + config.value + '</span></li>');
          });
        })
      }

      // display number of results
      if(matchedTests.length > 1){
        $('#header-result').html('' +
        '<div class="card mb-3">' +
          '<div class="card-header">' +
            '<div class="row">' +
              '<div class="col-6">' +
                '<h5>' + matchedTests.length + ' tests found</h5>' +
              '</div>' +
              '<div class="col-6">'+
                '<button id="buttonDownloadAll" class="btn btn-success"><i class="fa fa-download" aria-hidden="true"></i> Download All</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>');
      } else if (matchedTests.length === 1){
        $('#header-result').html('' +
        '<div class="card mb-3">' +
          '<div class="card-header">' +
            '<div class="row">' +
              '<div class="col-6">' +
                '<h5>' + matchedTests.length + ' test found</h5>' +
              '</div>' +
              '<div class="col-6">'+
                '<button id="buttonDownloadAll" class="btn btn-success"><i class="fa fa-download" aria-hidden="true"></i> Download All</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>');
      } else {
        $('#header-result').html('' +
        '<div class="card mb-3">' +
          '<div class="card-header">' +
            '<div class="row">' +
              '<div class="col-6">' +
                '<h5>No test found</h5>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>');
      }

      // "Download All" button handler
      $('#buttonDownloadAll').click(function(){
        $.post('api/download/multiple', {ids: matchedTests}, function(data){
          window.location.href = 'api/download/id/multiple';
        });
      });

    })
  }

  // buttons listener (edit & delete)
  $('#tests-grid').on('click', '#deleteTest', function(){
    var r = confirm('Please confirm that you want to delete this test.');
    if(r === true){
      $.ajax({
        method: 'DELETE',
        url: 'api/tests/id/' + $(this).parent().parent().parent().attr('id'),
        success: function(data){
          location.reload();
        }
      })
    }
  })

  // Edit a test
  $('#tests-grid').on('click', '#editTest', function(){
    $.get('api/tests/id/' + $(this).parent().parent().parent().attr('id'), function(test){
      $('.modal-body').html('' +
      '<div class="form-group">' +
        '<label for="inputDateEdit">Date</label>' +
        '<input type="date" id="inputDateEdit" max="2100-12-31" min="2010-01-01" class="form-control" value="' + test.date + '" required>' +
      '</div>'
      );
      test.configuration.forEach(function(config){
        $('.modal-body').append('' +
        '<div class="form-group">' +
          '<label>' + config.name + '</label>' +
          '<select class="form-control selectConfigEdit ' + config.name + '">' +
            '<option>' + config.value + '</option>' +
          '</select>' +
        '</div>'
        );
        $.get('api/test-subjects/options/' + test.type + '/' + config.name, function(options){
          if(options.length > 0) {
            options.forEach(function(option, idx, array){
              if(option !== $('.selectConfigEdit.' + config.name).val()) {
                $('.selectConfigEdit.' + config.name).append('<option>' + option + '</option>');
              }
              if(idx === array.length-1) {
                $('.selectConfigEdit.' + config.name).append('<option>Other</option>');
              }
            });
          } else {
            $('.selectConfigEdit.' + config.name).append('<option>Other</option>');
          }
        });
      });
      $('.modal-footer').html('' +
        '<input type="submit" value="Apply" class="btn btn-info" id="submit-edit">' +
        '<button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>'
      );
      $('.form-edit').attr('id', test['_id']);
    });
  });

  // add an input if the user select "Other" on a configuration
  $('#myModal').on('change', '.selectConfigEdit', function(){
    if($(this).val() === 'Other'){
      $(this).closest('.form-group').append('<input type="text" class="form-control inputConfigEdit" required>');
    } else {
      $(this).closest('.form-group').find('.inputConfigEdit').remove();
    }
  });

  $('.form-edit').submit(function(e){
    e.preventDefault();
    var r = confirm('Please confirm that you want to modify this test.');
    if(r === true) {
      var okayToPush = true;
      var test = {
        date: $('#inputDateEdit').val(),
        configuration: [],
      };
      $('.selectConfigEdit').each(function(){
        if($(this).val() !== 'Other'){
          test.configuration.push({
            name: $(this).prev().html(),
            value: $(this).val().trim()
          });
        }
      });
      $('.inputConfigEdit').each(function(){
        if($(this).val().trim() === ""){
          okayToPush = false;
        } else {
          test.configuration.push({
            name: $(this).prev().prev().html(),
            value: $(this).val().trim()
          });
        }
      });

      if(okayToPush === true) {
        $.post('api/tests/id/' + $('.form-edit').attr('id'), test, function(data){
          //alert(JSON.stringify(data, null, 2));
          location.reload();
        });
      } else {
        alert("Your test was not added because you left an empty field.");
      }

    }
  })

  search({});

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
          res += master.firstname + ' ' + master.lastname + ': ' + master.email + '\n';
        })
      }
    })
    return res;
  }

})(jQuery);
