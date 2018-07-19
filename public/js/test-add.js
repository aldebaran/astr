(function($) {
  'use strict';

  if (!hasWritePermission()) {
    showModal('Information', 'Welcome on the Archiver page !<br><br>Since you don\'t have the write permission, you won\'t be able to archive a new test.<br><br>Contact a master to modify your privileges.<br>' + getMasterList().replace(/\n/g, '<br>'));
  }

  // get the list of existing subjects
  $.get('api/test-subjects', function(subjects) {
    subjects.forEach(function(subject) {
      $('#selectSubject').append('<option value="' + subject['_id'] + '">' + subject.name + '</option>');
    });
  });

  $('#selectSubject').change(function() {
    if ($('#selectSubject').val() !== 'default') {
      $.get('api/test-subjects/id/' + $('#selectSubject').val(), function(subject) {
        $('#config').html('<h4>Configuration</h4>');
        subject.configuration.forEach(function(config) {
          $('#config').append('' +
          '<div class="form-group">' +
            '<label for="inputConfig">' + config.name + '</label>' +
            '<select class="form-control selectConfig">' +
            '</select>' +
            '<small class="form-text text-muted">Select an option or "Other"</small>' +
          '</div>');

          if (config.options.length > 0) {
            config.options.forEach(function(option, idx, array) {
              $('#config').find('select:last').append('<option>' + option + '</option>');
              if (idx === array.length - 1) {
                $('#config').find('select:last').append('<option>Other</option>');
              }
            });
          } else {
            $('#config').find('select:last').append('<option>Other</option>');
            $('.form-group:last').append('<input type="text" class="form-control inputConfig" required>');
          }
        });
        $('#config').append('<input type="submit" value="Submit" id="submitTest" class="btn btn-info">');
      });
    } else {
      $('#config').html('');
    }
  });

  // add an input if the user select "Other" on a configuration
  $('#cardAddNewTest').on('change', '.selectConfig', function() {
    if ($(this).val() === 'Other') {
      $(this).closest('.form-group').append('<input type="text" class="form-control inputConfig" required>');
    } else {
      $(this).closest('.form-group').find('.inputConfig').remove();
    }
  });

  // Submit event
  $('form').submit(function(e) {
    e.preventDefault();
    var okayToPush = true;
    if (isConnected() && hasWritePermission() && $('#isFileUploaded').val() === 'true') {
      var test = {
        type: $('#selectSubject option:selected').html(),
        date: $('#inputDate').val(),
        author: getUserName(),
        configuration: [],
      };
      if ($('#inputComments').val().trim() !== '') {
        test.comments = $('#inputComments').val().trim();
      }
      $('.inputConfig').each(function() {
        if ($(this).val().trim() === '') {
          okayToPush = false;
        } else {
          test.configuration.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val().trim(),
          });
        }
      });
      $('.selectConfig').each(function() {
        if ($(this).val() !== 'Other') {
          test.configuration.push({
            name: $(this).closest('.form-group').find('label').html(),
            value: $(this).val(),
          });
        }
      });

      if (okayToPush === true) {
        $('#submitTest').attr('disabled', true);
        $.ajax({
          method: 'POST',
          url: 'api/tests/add',
          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
          data: test,
          success: function(data) {
            $('#testId').html(data.test['_id']);
          },
        });
      } else {
        showModal('Error', 'Your test was not added because you left an empty field.');
      }
    } else if (!isConnected()) {
      showModal('Error', 'Please log in to submit new tests.');
    } else if (isConnected() && $('#isFileUploaded').val() === 'true') {
      showModal('Error', 'Sorry, you don\'t have the authorization to write new test subjects. Please contact an admin to modify your privileges.<br><br>Admins:<br>' + getMasterList().replace(/\n/g, '<br>'));
    } else if ($('#isFileUploaded').val() !== 'true') {
      showModal('Error', 'Upload a file to archive a new test.');
    }
  });

  // confirmation panel after reload of the page
  if (getUrlParameter('result') && getUrlParameter('result') === 'success') {
    $('<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        '<h5 class="alert-heading">Your test is now saved <i class="fa fa-check" aria-hidden="true"></i></h5>' +
        '<p><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Note that it may take a couple of seconds before you can download your archive (especially if you uploaded big files), because your files are being zipped.</p>' +
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
