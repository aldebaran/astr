(function($) {
  'use strict';

  if (getUrlParameter('error') && getUrlParameter('error') === 'password') {
    $('<div class="alert alert-danger" role="alert">' +
        'Password does not match the confirm password.' +
      '</div>').insertBefore('.form-group:first');
  }

  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');
    var sParameterName;
    var i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  }
})(jQuery);
