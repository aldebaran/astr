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
      alert('Fulfill the actual configuration input to add another!')
    }
  });

  $('#formConfig').on('click', '#buttonMoreOption', function(){
    // check if the last option row is not empty
    if($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOption" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      alert('Fulfill the actual option to add another!')
    }
  })

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
            options.push($(this).val().trim().toLowerCase().replace(/\s+/g, ' '))
          })
          if(configName !== ''){
            subject.configuration.push({
              name: configName,
              options: options
            });
          }
        })

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
    })
  })

  $('#selectSubject').change(function(){
    if($('#selectSubject').val() !== "default"){
      $.get('api/test-subjects/' + $('#selectSubject').val(), function(data){
        $('#infoSubject').attr('val', data['_id']);
        $('#infoSubject').html('' +
        '<span class="key"> Name: </span><span class="value">' + data.name + '</span><br>' +
        '<span class="key"> Author: </span><span class="value" id="subjectAuthor">' + data.author + '</span><br>' +
        '<span class="key"> Created: </span><span class="value">' + new Date(data.created).toLocaleDateString() + '</span><br>' +
        '<span class="key"> Configuration</span><br>');
        data.configuration.forEach(function(config){
          $('#infoSubject').append('<li><span class="value">' + config.name + ': [' + config.options.join(', ') + ']' + '</span></li>');
        })

        // master can delete and edit the subject
        if(isMaster()) {
          $('#infoSubject').append('' +
            '<div class="button-footer">' +
              '<button type="button" class="btn btn-danger admin-user" id="deleteTestSubject"><i class="fa fa-times" aria-hidden="true"></i> Delete</button>' +
              '<button type="button" class="btn btn-info admin-user" id="deleteTestSubject"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</button>' +
            '</div>'
          );

          $('#deleteTestSubject').click(function(){
            var r = confirm('Please confirm that you want to delete this test subject.');
            if(r === true){
              $.ajax({
                url: 'api/test-subjects/' + $(this).parent().attr('val'),
                type: 'DELETE',
                success: function(data){
                  location.reload();
                }
              })
            }
          })
        }
      })
    } else {
      $('#infoSubject').html('');
    }

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
          res += master.firstname + ' ' + master.lastname + ': ' + master.email + '\n';
        })
      }
    })
    return res;
  }

})(jQuery);
