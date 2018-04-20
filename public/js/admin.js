(function($) {
  "use strict";

  $.get('api/user/profile', function(user){
    // check if the user is master and is logged
    if(user.master === false || user.error) {
      $('body').html('<pre style="color: white;">Well tried but you\'re not a master!</pre>')
    } else {
      $.get('api/user', function(users){
        // fillout the table with users
        users.forEach(function(user){
          if(user.master === true){
            $('tbody').append('' +
            '<tr value="' + user['_id'] + '">' +
              '<td>' + user.firstname + '</td>'+
              '<td>' + user.lastname + '</td>' +
              '<td>' + user.email + '</td>' +
              '<td id="write_permission'+user['_id']+'">' + user.write_permission + '</td>' +
              '<td id="master'+user['_id']+'">' + user.master + '<button type="button" class="btn btn-info admin-user" id="modifyMaster">Modify</button></td>' +
              '<td><button type="button" class="btn btn-danger admin-user" id="deleteUser">Delete</button></td>' +
            '</tr>');
          } else {
            $('tbody').append('' +
            '<tr value="' + user['_id'] + '">' +
              '<td>' + user.firstname + '</td>'+
              '<td>' + user.lastname + '</td>' +
              '<td>' + user.email + '</td>' +
              '<td id="write_permission'+user['_id']+'">' + user.write_permission + '<button type="button" class="btn btn-info admin-user" id="modifyWritePermission">Modify</button></td>' +
              '<td id="master'+user['_id']+'">' + user.master + '<button type="button" class="btn btn-info admin-user" id="modifyMaster">Modify</button></td>' +
              '<td><button type="button" class="btn btn-danger admin-user" id="deleteUser">Delete</button></td>' +
            '</tr>');
          }

          if(user.write_permission === true) {
            $('#write_permission'+user['_id']).css('color','green');
          } else {
            $('#write_permission'+user['_id']).css('color','red');
          }
          if(user.master === true) {
            $('#master'+user['_id']).css('color','green');
          } else {
            $('#master'+user['_id']).css('color','red');
          }

        })
      })

      // modify and delete buttons
      $('tbody').on('click', '#modifyWritePermission', function(){
        var r = confirm('Please confirm that you want to modify the write permission of this user.');
        if(r === true){
          $.post('api/user/id/' + $(this).parent().parent().attr('value'), {"write_permission": !$(this).parent().html().includes('true')}, function(data){
            location.reload();
          })
        }
      })
      $('tbody').on('click', '#modifyMaster', function(){
        var r = confirm('Please confirm that you want to modify the master status of this user.');
        if(r === true){
          $.post('api/user/id/' + $(this).parent().parent().attr('value'), {"master": !$(this).parent().html().includes('true')}, function(data){
            location.reload();
          })
        }
      })
      $('tbody').on('click', '#deleteUser', function(){
        var r = confirm('Please confirm that you want to delete this user.');
        if(r === true){
          $.ajax({
            url: 'api/user/id/' + $(this).parent().parent().attr('value'),
            type: 'DELETE',
            success: function(data){
              location.reload();
            }
          })
        }
      })


    }
  })

})(jQuery);
