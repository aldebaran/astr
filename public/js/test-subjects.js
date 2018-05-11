(function($) {
  "use strict";

  // Create a new test subject
  $('#buttonMoreConfig').click(function(){
    // check if the last configuration row is not empty
    if($('.inputConfigName:last').val().trim() !== '') {
      $('#formConfig').append('' +
      '<div class="form-group">' +
        '<div class="row config border-top">' +
          '<div class="col">' +
            '<label id="labelConfigName">Configuration name</label>' +
            '<input type="text" class="form-control inputConfigName" placeholder="Enter the configuration name">' +
          '</div>' +
          '<div class="col">' +
            '<label>Options</label>' +
            '<input class="form-control inputOption" type="text" placeholder="Enter an option" style="margin-top: 0px;">' +
            '<button type="button" class="btn btn-outline-primary" id="buttonMoreOption"><i class="fa fa-plus-circle"></i> Option</button>' +
          '</div>' +
        '</div>' +
      '</div>');
    } else {
      alert('Fulfill the actual configuration input to add another!');
    }
  });

  $('#formConfig').on('click', '#buttonMoreOption', function(){
    // check if the last option row is not empty
    if($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOption" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      alert('Fulfill the actual option to add another!');
    }
  });

  // modify the configuration name
  $('#submitNewSubject').on('change', '.inputConfigName', function(){
    $(this).closest('.form-group').find('#labelConfigName').html($(this).val().trim().toLowerCase().replace(/\s+/g, '_'));
  });

  $('#submitNewSubject').submit(function(e){
    e.preventDefault();

    // if the user is logged and is master
    if(isConnected() && isMaster()) {
      var r = confirm('Please confirm that you want to add this new test subject.')
      if(r === true){
        var subject = {
          name: $('#inputName').val().trim().replace(/\s+/g, ' '),
          author: getUserName(),
          configuration: [],
        }
        $('.inputConfigName').each(function(){
          var configName = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
          var options = [];
          $(this).closest('.row').find('.inputOption').each(function(){
            if($(this).val().trim() !== '') {
              options.push($(this).val().trim().toLowerCase().replace(/\s+/g, ' '));
            }
          });
          if(configName !== ''){
            subject.configuration.push({
              name: configName,
              options: options
            });
          }
        });

        // send the new subject
        $.post('api/test-subjects', subject, function(data){
          //alert(JSON.stringify(data, null, 2));
          location.reload();
        })
      }
    } else if(isConnected()) {
      // if the user is logged but without permission
      alert('Sorry, you don\'t have the authorization to write new test subjects. Please contact an admin to modify your privileges.\n\nAdmins:\n' + getMasterList());
    } else {
      // if the user isn't logged
      alert('Please log in to add a new test subject !');
    }
  });


  // Existing subjects
  $.get('api/test-subjects', function(subjects){
    subjects.forEach(function(subject){
      $('#selectSubject').append('<option value="' + subject['_id'] + '">' + subject.name + '</option>');
    });
  });

  $('#selectSubject').change(function(){
    if($('#selectSubject').val() !== "default"){
      $.get('api/test-subjects/id/' + $('#selectSubject').val(), function(data){
        $('#infoSubject').attr('val', data['_id']);
        $('#infoSubject').html('' +
        '<span class="key"> Name: </span><span class="value">' + data.name + '</span><br>' +
        '<span class="key"> Author: </span><span class="value" id="subjectAuthor">' + data.author + '</span><br>' +
        '<span class="key"> Created: </span><span class="value">' + new Date(data.created).toLocaleDateString() + '</span><br>' +
        '<span class="key"> Configuration</span><br>');
        data.configuration.forEach(function(config){
          $('#infoSubject').append('<li><span class="value">' + config.name + ': [' + config.options.join(', ') + ']' + '</span></li>');
        });

        // master can delete and edit the subject
        if(isMaster()) {
          $('#infoSubject').append('' +
            '<div class="button-footer">' +
              '<button type="button" class="btn btn-danger admin-user" id="deleteTestSubject"><i class="fa fa-times" aria-hidden="true"></i> Delete</button>' +
              '<button type="button" class="btn btn-info admin-user" id="editTestSubject" data-toggle="modal" data-target="#myModal"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</button>' +
            '</div>'
          );

          $('#deleteTestSubject').click(function(){
            var r = confirm('Please confirm that you want to delete this test subject.');
            if(r === true){
              $.ajax({
                url: 'api/test-subjects/id/' + $(this).closest('#infoSubject').attr('val'),
                type: 'DELETE',
                success: function(data){
                  location.reload();
                }
              });
            }
          });
        }
      });
    } else {
      $('#infoSubject').html('');
    }
  })

  // Edit test subject
  $('#cardExistingSubject').on('click', '#editTestSubject', function(){
    $.get('api/test-subjects/id/' + $(this).closest('.card-body').find('#selectSubject').val(), function(subject){
      $('.modal-body').html('' +
      '<div class="form-group">' +
        '<label for="inputNameEdit">Name</label>' +
        '<input type="text" id="inputNameEdit" class="form-control" value="' + subject.name + '" required>' +
      '</div>'
      );
      subject.configuration.forEach(function(config){
        $('.modal-body').append('' +
        '<div class="form-group">' +
          '<div class="row config border-top">' +
            '<div class="col">' +
              '<label id="labelConfigNameEdit">Configuration name</label>' +
              '<input type="text" class="form-control inputConfigNameEdit" id="inputConfigNameEdit" value="' + config.name + '">' +
            '</div>' +
            '<div class="col">' +
              '<label id="label' + config.name + '">Options</label>' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
            '</div>' +
          '</div>' +
        '</div>');

        if(config.options.length > 0) {
          config.options.forEach(function(option){
            $('<input class="form-control inputOptionEdit" type="text" value="' + option + '">').insertAfter('#label'+config.name);
          });
        }
      });

      // button to add a new config
      $('<button type="button" class="btn btn-outline-primary" id="buttonMoreConfigEdit"><i class="fa fa-plus-circle"></i> Configuration</button>').insertAfter('.modal-body .form-group:last');
    });
  });

  // modal button listener (new config)
  $('.modal-body').on('click', '#buttonMoreConfigEdit', function(){
    if($(this).parent().find('.form-group:last').find('#inputConfigNameEdit').val().trim() !== ''){
      $('' +
      '<div class="form-group">' +
        '<div class="row config border-top">' +
          '<div class="col">' +
            '<label id="labelConfigNameEdit">Configuration name</label>' +
            '<input type="text" class="form-control inputConfigNameEdit" id="inputConfigNameEdit" placeholder="Enter the name">' +
          '</div>' +
          '<div class="col">' +
            '<label>Options</label>' +
            '<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option" style="margin-top: 0px;">' +
            '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
          '</div>' +
        '</div>' +
      '</div>').insertBefore('#buttonMoreConfigEdit');
    } else {
      alert('Fulfill the actual configuration to add another!');
    }
  });

  // modal button listener (new option)
  $('.modal-body').on('click', '#buttonMoreOptionEdit', function(){
    if($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      alert('Fulfill the actual option to add another!');
    }
  });

  // modify configuration name on change
  $('.modal-body').on('change', '.inputConfigNameEdit', function(){
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
    $(this).val(name);
  })

  // modify option name on change
  $('.modal-body').on('change', '.inputOptionEdit', function(){
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  // Submit event when editing a subject
  $('.form-edit').submit(function(e){
    e.preventDefault();
    var r = confirm('Please confirm that you want to add this new test subject.');
    if(r === true){
      var editedSubject = {
        name: $('#inputNameEdit').val().replace(/\s+/g, ' '),
        configuration: []
      };
      $('.inputConfigNameEdit').each(function(){
        if($(this).val().trim() !== ''){
          var config = {
            name: $(this).val(),
            options: []
          };
          $(this).closest('.form-group').find('.inputOptionEdit').each(function(){
            if($(this).val().trim() !== ''){
              config.options.push($(this).val());
            }
          });
          editedSubject.configuration.push(config);
        }
      })

      $.post('api/test-subjects/id/' + $('#infoSubject').attr('val'), editedSubject, function(data){
        if(data.name === 'Success') {
          location.reload();
        } else {
          alert('Someting went wrong.');
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
