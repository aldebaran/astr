(function($) {
  "use strict";

  $.get('api/tests', function(tests) {
    $('#numberOfTests').html(tests.length + ' Tests archived');
  });
  $.get('api/test-subjects', function(tests) {
    $('#numberOfTestSubjects').html(tests.length + ' Test subjects');
  });

})(jQuery);
