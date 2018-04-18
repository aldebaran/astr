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
      if(user.name) {
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
          alert(JSON.stringify(data, null, 2))
          location.reload();
        })

      } else {
        alert('Please login to add a new test subject !')
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
        $('#infoSubject').html('' +
        '<span class="key"> Name: </span><span class="value">' + data.name + '</span><br>' +
        '<span class="key"> Author: </span><span class="value">' + data.author + '</span><br>' +
        '<span class="key"> Configuration parameters:</span><br>');
        data.configuration.forEach(function(config){
          $('#infoSubject').append('<li><span class="value">' + config + '</span></li>');
        })

      })
    } else {
      $('#infoSubject').html('');
    }

  })

})(jQuery);
