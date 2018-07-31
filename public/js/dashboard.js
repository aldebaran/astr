(function($) {
  'use strict';

  $.get('api/archives', function(archives) {
    $('#numberOfArchives').html(archives.length);
    if (archives.length > 1) {
      $('#nbOfArchivesText').html('<strong>' + archives.length + '</strong> archives');
    } else {
      $('#nbOfArchivesText').html('<strong>' + archives.length + '</strong> archive');
    }
  });
  $.get('api/categories', function(archives) {
    $('#numberOfArchiveCategories').html(archives.length);
  });
  $.get('api/archives/authors', function(authors) {
    $('#numberOfAuthors').html(authors.length);
  });
})(jQuery);
