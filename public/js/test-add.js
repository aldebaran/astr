(function($) {
  "use strict";

  // get the list of existing subjects
  $.get('api/test-subjects', function(subjects){
    subjects.forEach(function(subject){
      $('#selectSubject').append('<option value="' + subject['_id'] + '">' + subject.name + '</option>');
    });
  });

  $('#selectSubject').change(function(){
    if($('#selectSubject').val() !== "default"){
      $.get('api/test-subjects/id/' + $('#selectSubject').val(), function(subject){
        $('#config').html('<h4>Configuration</h4>');
        subject.configuration.forEach(function(config){
          $('#config').append('' +
          '<div class="form-group">' +
            '<label for="inputConfig">' + config.name + '</label>' +
            '<select class="form-control selectConfig">' +
            '</select>' +
            '<small class="form-text text-muted">Select an option or "Other"</small>' +
          '</div>');

          if(config.options.length > 0) {
            config.options.forEach(function(option, idx, array){
              $('#config').find('select:last').append('<option>' + option + '</option>');
              if (idx === array.length - 1){
                $('#config').find('select:last').append('<option>Other</option>');
              }
            });
          } else {
            $('#config').find('select:last').append('<option>Other</option>');
            $('.form-group:last').append('<input type="text" class="form-control inputConfig" required>');
          }
        });
        $('#config').append('<input type="submit" value="Submit" id="submitTest" class="btn btn-info">');
      });
    } else {
      $('#config').html('');
    }
  })

  // add an input if the user select "Other" on a configuration
  $('#cardAddNewTest').on('change', '.selectConfig', function(){
    if($(this).val() === 'Other'){
      $(this).closest('.form-group').append('<input type="text" class="form-control inputConfig" required>');
    } else {
      $(this).closest('.form-group').find('.inputConfig').remove();
    }
  });

  // Submit event
  $('form').submit(function(e){
    e.preventDefault();
    var okayToPush = true;
    if(isConnected() && hasWritePermission() && $('#isFileUploaded').val() === 'true'){
      var test = {
        type: $('#selectSubject option:selected').html(),
        date: $('#inputDate').val(),
        author: getUserName(),
        configuration: [],
      };
      $('.inputConfig').each(function(){
        if($(this).val().trim() === ""){
          okayToPush = false;
        } else {
          test.configuration.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val().trim()
          });
        }
      });
      $('.selectConfig').each(function(){
        if($(this).val() !== 'Other'){
          test.configuration.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val()
          });
        }
      });

      if(okayToPush === true) {
        $('#submitTest').attr("disabled", true);
        $.post('api/tests/add', test, function(data){
          $('#testId').html(data.test['_id']);
        });
      } else {
        alert("Your test was not added because you left an empty field.");
      }
    } else if(!isConnected()){
      alert('Please log in to submit new tests !')
    } else if(isConnected() && $('#isFileUploaded').val() === 'true') {
      alert('Sorry, you don\'t have the authorization to write new test subjects. Please contact an admin to modify your privileges.\n\nAdmins:\n' + getMasterList());
    } else if ($('#isFileUploaded').val() !== 'true') {
      alert('Upload a file to add a new test !');
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
