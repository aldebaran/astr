(function($) {
  "use strict";

  var nbConfig = 1;

  $('#buttonMoreConfig').click(function(){
    if($('#inputConfig'+nbConfig).val().trim() !== '') {
      nbConfig++;
      $('#formConfig').append('' +
      '<div class="row config">' +
        '<div class="col">' +
          '<input type="text" class="form-control" id="inputConfig' + nbConfig + '" placeholder="Enter another configuration">' +
        '</div>' +
        '<div class="col">' +
          '<input class="form-control" id="configName' + nbConfig + '" type="text" placeholder="" disabled>' +
        '</div>' +
      '</div>');
      $('#inputConfig'+nbConfig).change(function(){
        $('#configName'+nbConfig).attr('placeholder', $('#inputConfig'+nbConfig).val().trim().toLowerCase().replace(/\s+/g, '_'));
      });
    } else {
      alert('Fulfill the actual configuration input to add another!')
    }
  });

  $('#inputConfig1').change(function(){
    $('#configName1').attr('placeholder', $('#inputConfig1').val().trim().toLowerCase().replace(/\s+/g, '_'));
  });


})(jQuery);
