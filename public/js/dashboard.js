(function($) {
  'use strict';

  $.get('api/tests', function(tests) {
    $('#numberOfTests').html(tests.length);
    $('#nbOfTests').html(tests.length);
  });
  $.get('api/test-subjects', function(tests) {
    $('#numberOfTestSubjects').html(tests.length);
  });
  $.get('api/tests/authors', function(authors) {
    $('#numberOfAuthors').html(authors.length);
  });
})(jQuery);
