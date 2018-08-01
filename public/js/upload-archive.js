(function($) {
  'use strict';

  if (!hasWritePermission()) {
    showModal('Information', 'Welcome on the Archiver page !<br><br>Since you don\'t have the write permission, you won\'t be able to upload a new archive.<br><br>Contact a master to modify your privileges.<br>' + getMasterList().replace(/\n/g, '<br>'));
  }

  // get the list of existing categories
  $.get('api/categories', function(categories) {
    categories.forEach(function(category) {
      $('#selectCategory').append('<option value="' + category._id + '">' + category.name + '</option>');
    });
  });

  $('#selectCategory').change(function() {
    if ($('#selectCategory').val() !== 'default') {
      $.get('api/categories/id/' + $('#selectCategory').val(), function(category) {
        $('#descriptors').html('<h4>Descriptors</h4>');
        category.descriptors.forEach(function(descriptor) {
          $('#descriptors').append('' +
          '<div class="form-group">' +
            '<label for="inputDescriptor">' + descriptor.name + '</label>' +
            '<select class="form-control selectDescriptor">' +
            '</select>' +
            '<small class="form-text text-muted">Select an option or "Other"</small>' +
          '</div>');

          if (descriptor.options.length > 0) {
            descriptor.options.forEach(function(option, idx, array) {
              $('#descriptors').find('select:last').append('<option>' + option + '</option>');
              if (idx === array.length - 1) {
                $('#descriptors').find('select:last').append('<option>Other</option>');
              }
            });
          } else {
            $('#descriptors').find('select:last').append('<option>Other</option>');
            $('.form-group:last').append('<input type="text" class="form-control inputDescriptor" required>');
          }
        });
        $('#descriptors').append('<input type="submit" value="Submit" id="submitArchive" class="btn btn-info">');
      });
    } else {
      $('#descriptors').html('');
    }
  });

  // add an input if the user select "Other" on a descriptor
  $('#cardAddNewArchive').on('change', '.selectDescriptor', function() {
    if ($(this).val() === 'Other') {
      $(this).closest('.form-group').append('<input type="text" class="form-control inputDescriptor" required>');
    } else {
      $(this).closest('.form-group').find('.inputDescriptor').remove();
    }
  });

  // Submit event
  $('form').submit(function(e) {
    e.preventDefault();
    var okayToPush = true;
    if (isConnected() && hasWritePermission() && $('#isFileUploaded').val() === 'true') {
      var archive = {
        category: $('#selectCategory option:selected').html(),
        date: $('#inputDate').val(),
        author: getUserName(),
        descriptors: [],
      };
      if ($('#inputComments').val().trim() !== '') {
        archive.comments = $('#inputComments').val().trim();
      }
      $('.inputDescriptor').each(function() {
        if ($(this).val().trim() === '') {
          okayToPush = false;
        } else {
          archive.descriptors.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val().trim(),
          });
        }
      });
      $('.selectDescriptor').each(function() {
        if ($(this).val() !== 'Other') {
          archive.descriptors.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val(),
          });
        }
      });

      if (okayToPush === true) {
        $('#submitArchive').attr('disabled', true);
        $.ajax({
          method: 'POST',
          url: 'api/archives/add',
          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
          data: archive,
          success: function(data) {
            $('#archiveId').html(data.archive._id);
          },
        });
      } else {
        showModal('Error', 'Your archive was not added because you left an empty field.');
      }
    } else if (!isConnected()) {
      showModal('Error', 'Please log in to submit new archives.');
    } else if (isConnected() && $('#isFileUploaded').val() === 'true') {
      showModal('Error', 'Sorry, you don\'t have the authorization to upload new archives. Please contact an admin to modify your privileges.<br><br>Admins:<br>' + getMasterList().replace(/\n/g, '<br>'));
    } else if ($('#isFileUploaded').val() !== 'true') {
      showModal('Error', 'Add some file(s) in the dropzone.');
    }
  });

  // confirmation panel after reload of the page
  if (getUrlParameter('result') && getUrlParameter('result') === 'success') {
    $('<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        '<h5 class="alert-heading">Your archive is now saved <i class="fa fa-check" aria-hidden="true"></i></h5>' +
        '<p><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Note that it may take a couple of seconds before you can download your files (especially if you uploaded big files), because your files are being zipped.</p>' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
          '<span aria-hidden="true">&times;</span>' +
        '</button>' +
      '</div>').insertBefore('.row:first');
  }


  // -------------------------- Functions -------------------------- //

  function isConnected() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = !user.error;
      },
    });
    return res;
  }

  function hasWritePermission() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user['write_permission'];
      },
    });
    return res;
  }

  function getUserName() {
    var res;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.name;
      },
    });
    return res;
  }

  function getMasterList() {
    var res = '';
    $.ajax({
      type: 'GET',
      url: 'api/user/master',
      async: false,
      success: function(masters) {
        masters.forEach(function(master) {
          res += master.firstname + ' ' + master.lastname + ': ' + master.email + '\n';
        });
      },
    });
    return res;
  }

  function getAuthentification() {
    var res;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.email + ':' + getCookie('session-token');
      },
    });
    return res;
  }

  function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
  }

  function showModal(title, message) {
    $('#myModal .modal-header').html('<h4 class="modal-title">' + title + '</h4>');
    $('#myModal .modal-body').html('<p>' + message + '<p>');
    $('#myModal').modal('show');
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
