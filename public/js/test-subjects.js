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
    $.get('api/user/profile', function(user){
      // check if the user is logged
      if(user.email && user['write_permission'] === true) {
        var subject = {
          name: $('#inputName').val().trim().replace(/\s+/g, ' '),
          configuration: [],
          author: user.name,
        }
        $('.configName').each(function(){
          if($(this).attr('placeholder') !== ''){
            subject.configuration.push($(this).attr('placeholder'));
          }
        })

        // send the new subject
        $.post('api/test-subjects', subject, function(data){
          alert(JSON.stringify(data, null, 2));
          location.reload();
        })

      } else if(user['write_permission'] === false) {
        $.get('api/user/master', function(masters){
          var masterNames = "";
          masters.forEach(function(master){
            masterNames += master.firstname + ' ' + master.lastname + '\n';
          })
          alert('Sorry, you don\'t have the authorization to write new test subjects. Please contact an admin to modify your privileges.\n\nAdmins:\n' + masterNames);
        })

      } else {
        alert('Please login to add a new test subject !');
      }
    });
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
        '<span class="key"> Configuration parameters:</span><br>');
        data.configuration.forEach(function(config){
          $('#infoSubject').append('<li><span class="value">' + config + '</span></li>');
        })

        // user can delete the subject if he is the owner or a master
        $.get('api/user/profile', function(user){
          if(user.master === true || (user.name === $('#subjectAuthor').html())) {
            $('#infoSubject').append('<br><button type="button" class="btn btn-danger" id="deleteTestSubject">Delete</button>');
            $('#deleteTestSubject').click(function(){
              var r = confirm("Please confirm that you want to delete this test subject.");
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

      })
    } else {
      $('#infoSubject').html('');
    }

  })

})(jQuery);
