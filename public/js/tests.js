(function($) {
  "use strict";

  $.get('api/tests', function(tests){
    tests.forEach(function(test){
      $('#tests-grid').append('<div class="col-3"><div class="card mb-3">' +
        '<div class="card-header"><i class="fa fa-wrench"></i> '+ test.type + '</div>' +
        '<div class="card-body tests" id="' + test['_id'] + '">' +
        '</div>' +
        '<div class="card-footer small text-muted">id: ' + test['_id'] + '</div>' +
      '</div></div>');

      Object.keys(test).forEach(function(key){
        if(key != '_id' && key != '__v'){
          $('#'+test['_id']).append('<span class="key">' + key + ': </span><span class="value">' + test[key] + '</span><br>')
        }
      })
    })
  })

})(jQuery);
