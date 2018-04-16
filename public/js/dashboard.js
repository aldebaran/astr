(function($) {
  "use strict";

  $.get('api/tests', function(tests){
    $('#numberOfTests').html(tests.length + ' Tests');

  })

})(jQuery);
