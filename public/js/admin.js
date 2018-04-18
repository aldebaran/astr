(function($) {
  "use strict";

  $.get('api/user/profile', function(user){
    // check if the user is master and is logged
    if(user.master === false || user.error) {
      $('body').html('<pre style="color: white;">Well tried but you\'re not a master!</pre>')
    } else {
      $.get('api/user', function(users){
        users.forEach(function(user){
          $('tbody').append('' +
          '<tr>' +
            '<td>' + user.firstname + '</td>'+
            '<td>' + user.lastname + '</td>' +
            '<td>' + user.email + '</td>' +
            '<td>' + user.write_permission + '</td>' +
            '<td>' + user.master + '</td>' +
            '<td><button type="button" class="btn btn-info" style="margin-right:10px;">Modify</button><button type="button" class="btn btn-danger">Delete</button></td>' +
          '</tr>');
        })
      })

    }
  })

})(jQuery);
