(function($) {
  "use strict";

  // Create a new test subject
  var nbConfig = 1;
  $('#buttonMoreConfig').click(function(){
    // check if the last configuration row is not empty
    if($('#inputConfig'+nbConfig).val().trim() !== '') {
      nbConfig++;
      $('#formConfig').append('' +
      '<div class="row config">' +
        '<div class="col">' +
          '<input type="text" class="form-control inputConfig" id="inputConfig' + nbConfig + '" placeholder="Enter another configuration">' +
        '</div>' +
        '<div class="col">' +
          '<input class="form-control configName" id="configName' + nbConfig + '" type="text" placeholder="" disabled>' +
        '</div>' +
      '</div>');
    } else {
      alert('Fulfill the actual configuration input to add another!')
    }
  });

  // modify the configuration name
  $('#submitNewSubject').on('change', '.inputConfig', function(){
    $(this).parent().parent().find('.configName').attr('placeholder', $(this).val().trim().toLowerCase().replace(/\s+/g, '_'));
  });

  $('#submitNewSubject').submit(function(e){
    e.preventDefault();

    // if the user is logged and has permission
    if(isConnected() && hasWritePermission()) {
      var r = confirm('Please confirm that you want to add this new test subject.')
      if(r === true){
        var subject = {
          name: $('#inputName').val().trim().replace(/\s+/g, ' '),
          configuration: [],
          author: getUserName(),
        }
        $('.configName').each(function(){
          if($(this).attr('placeholder') !== ''){
            subject.configuration.push($(this).attr('placeholder'));
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
        '<span class="key"> Configuration parameters:</span><br>');
        data.configuration.forEach(function(config){
          $('#infoSubject').append('<li><span class="value">' + config + '</span></li>');
        })

        // user can delete the subject if he is the owner or a master
        if(isMaster() || getUserName() === $('#subjectAuthor').html()) {
          $('#infoSubject').append('<br><button type="button" class="btn btn-danger" id="deleteTestSubject">Delete</button>');
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
          res += master.firstname + ' ' + master.lastname + '\n';
        })
      }
    })
    return res;
  }

})(jQuery);
