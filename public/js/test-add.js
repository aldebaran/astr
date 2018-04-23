(function($) {
  "use strict";

  // get the list of existing subjects
  $.get('api/test-subjects', function(subjects){
    subjects.forEach(function(subject){
      $('#selectSubject').append('<option value="' + subject['_id'] + '" name="' + subject.name + '">' + subject.name + '</option>');
    })
  })

  $('#selectSubject').change(function(){
    if($('#selectSubject').val() !== "default"){
      $.get('api/test-subjects/' + $('#selectSubject').val(), function(subject){
        $('#config').html('<h4>Configuration</h4>');
        subject.configuration.forEach(function(config){
          $('#config').append('' +
          '<div class="form-group">' +
            '<label for="inputConfig">' + config + '</label>' +
            '<input type="text" class="form-control" id="inputConfig" name="' + config + '" required>' +
          '</div>');
        })
        $('#config').append('<input type="submit" class="btn btn-info">')
      });
    } else {
      $('#config').html('');
    }
  })

  $('form').submit(function(e){
    e.preventDefault();
    var test = {
      type: $('#selectSubject').attr('name'),
      date: $('#date').val(),
    }
    console.log(test)
  })

})(jQuery);
