(function($) {
  'use strict';

  if (!isMaster()) {
    showModal('Information', 'Welcome on the Test Subject page !<br><br>Since you are not a Master, you won\'t be able to modify or create new test subjects. But you can still take a look at the existing subjects.');
  }

  // Create a new test subject
  $('#buttonMoreConfig').click(function() {
    // check if the last configuration row is not empty
    if ($('.inputConfigName:last').val().trim() !== '') {
      $('#formConfig').append('' +
      '<div class="form-group">' +
        '<div class="row config border-bottom">' +
          '<div class="col">' +
            '<label id="labelConfigName">Configuration name</label>' +
            '<input type="text" class="form-control inputConfigName" placeholder="Enter the configuration name">' +
            '<div class="makeLinkDisabled">' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMakeLink"><i class="fa fa-link"></i> Link</button>' +
              '<small class="form-text text-muted infoLink">' +
                '<i class="fa fa-question-circle infoLinkIcon tooltipInfoLink" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" data-html="true" title="You can turn this configuration into a link.<br>' +
                'Just specify the base URL, the value of the configuration will be added automatically at the end to create the link.<br><br>' +
                '<strong>Example</strong><br>' +
                'Configuration name: <i>Issue ID</i><br>' +
                'Base URL: <i>https://redmine.aldebaran.lan/issues/</i><br>' +
                'Configuration value: <i>42305</i><br>' +
                'Link: <i>https://redmine.aldebaran.lan/issues/42305</i><br><br>' +
                '<i class=&quot;fa fa-warning&quot; aria-hidden=&quot;true&quot;></i> Don\'t forget the &quot;/&quot; at the end of the base URL.">' +
                '</i>' +
              '</small>' +
            '</div>' +
            '<div class="makeLinkEnabled" style="display: none;">' +
              '<div class="row makeLink">' +
                '<div class="col">' +
                  '<input class="form-control inputUrlBase" type="text" placeholder="Enter the base URL">' +
                '</div>' +
                '<div class="col-2">' +
                  '<button type="button" class="btn btn-warning deleteLink" id="deleteLink"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                '</div>' +
              '</div>' +
              '<small class="form-text text-muted">Example: https://redmine.aldebaran.lan/issues/</small>' +
            '</div>' +
          '</div>' +
          '<div class="col">' +
            '<label>Options</label>' +
            '<input class="form-control inputOption" type="text" placeholder="Enter an option" style="margin-top: 0px;">' +
            '<button type="button" class="btn btn-outline-primary" id="buttonMoreOption"><i class="fa fa-plus-circle"></i> Option</button>' +
          '</div>' +
        '</div>' +
      '</div>');
      $('[data-toggle="tooltip"]').tooltip();
    } else {
      showModal('Warning', 'Fulfill the actual configuration input to add another.');
    }
  });

  $('#formConfig').on('click', '#buttonMoreOption', function() {
    // check if the last option row is not empty
    if ($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOption" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      showModal('Warning', 'Fulfill the actual option to add another.');
    }
  });

  $('#formConfig').on('click', '#buttonMakeLink', function() {
    $(this).closest('div').hide();
    $(this).closest('div').next().show();
  });

  $('#formConfig').on('click', '#deleteLink', function() {
    $(this).closest('.makeLinkEnabled').hide();
    $(this).closest('.makeLinkEnabled').prev().show();
  });

  // modify test subject name
  $('#inputName').change(function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  // modify the configuration name
  $('#submitNewSubject').on('change', '.inputConfigName', function() {
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
    $(this).val(name);
  });

  // modify option name on change
  $('#submitNewSubject').on('change', '.inputOption', function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  $('#submitNewSubject').submit(function(e) {
    e.preventDefault();

    // if the user is logged and is master
    if (isConnected() && isMaster()) {
      var r = confirm('Please confirm that you want to add this new test subject.');
      if (r === true) {
        var subject = {
          name: $('#inputName').val().trim().replace(/\s+/g, ' '),
          author: getUserName(),
          configuration: [],
        };
        $('.inputConfigName').each(function() {
          var configName = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
          var options = [];
          $(this).closest('.row').find('.inputOption').each(function() {
            if ($(this).val().trim() !== '') {
              options.push($(this).val().trim().toUpperCase().replace(/\s+/g, ' '));
            }
          });
          if (configName !== '') {
            if ($(this).siblings('.makeLinkEnabled').is(':visible') && $(this).siblings('.makeLinkEnabled').find('.inputUrlBase').val().trim() !== '') {
              // configuration with link
              subject.configuration.push({
                name: configName,
                options: options,
                baseUrl: $(this).siblings('.makeLinkEnabled').find('.inputUrlBase').val().trim(),
              });
            } else {
              // simple configuration
              subject.configuration.push({
                name: configName,
                options: options,
              });
            }
          }
        });

        // send the new subject
        $.ajax({
          method: 'POST',
          url: 'api/test-subjects',
          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
          data: subject,
          success: function() {
            location.reload();
          },
        });
      }
    } else if (isConnected()) {
      // if the user is logged but without permission
      showModal('Error', 'Sorry, you don\'t have the authorization to write new test subjects. Please contact an admin to modify your privileges.<br><br>Admins:<br>' + getMasterList().replace(/\n/g, '<br>'));
    } else {
      // if the user isn't logged
      showModal('Error', 'Please log in to add a new test subject !');
    }
  });


  // Existing subjects
  $.get('api/test-subjects', function(subjects) {
    subjects.forEach(function(subject) {
      $('#selectSubject').append('<option value="' + subject['_id'] + '">' + subject.name + '</option>');
    });
  });

  $('#selectSubject').change(function() {
    if ($('#selectSubject').val() !== 'default') {
      $.get('api/test-subjects/id/' + $('#selectSubject').val(), function(data) {
        $('#infoSubject').attr('val', data['_id']);
        $('#infoSubject').html('' +
        '<span class="key"> Name: </span><span class="value">' + data.name + '</span><br>' +
        '<span class="key"> Author: </span><span class="value" id="subjectAuthor">' + data.author + '</span><br>' +
        '<span class="key"> Created: </span><span class="value">' + new Date(data.created).toLocaleDateString() + '</span><br>' +
        '<span class="key"> Configuration</span><br>');
        data.configuration.forEach(function(config) {
          if (config.options.length > 0 && config.baseUrl) {
            $('#infoSubject').append('<li class="config"><span><i class="fa fa-link" aria-hidden="true"></i> ' + config.name + '</span><span class="value"> <a href="' + config.baseUrl + '">(' + config.baseUrl + '[:' + config.name + '])</a> [' + config.options.join(', ') + ']' + '</span></li>');
          } else if (config.options.length > 0) {
            $('#infoSubject').append('<li class="config"><span>' + config.name + '</span><span class="value"> [' + config.options.join(', ') + ']' + '</span></li>');
          } else if (config.baseUrl) {
            $('#infoSubject').append('<li class="config"><span><i class="fa fa-link" aria-hidden="true"></i> ' + config.name + '</span><span class="value"> <a href="' + config.baseUrl + '">(' + config.baseUrl + '[:' + config.name + '])</a></span></li>');
          } else {
            $('#infoSubject').append('<li class="config"><span>' + config.name + '</span></li>');
          }
        });

        // master can delete and edit the subject
        if (isMaster()) {
          $('#infoSubject').append('' +
            '<div class="button-footer">' +
              '<button type="button" class="btn btn-danger admin-user" id="deleteTestSubject"><i class="fa fa-times" aria-hidden="true"></i> Delete</button>' +
              '<button type="button" class="btn btn-info admin-user" id="editTestSubject" data-toggle="modal" data-target="#modalEdit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</button>' +
            '</div>'
          );

          $('#deleteTestSubject').click(function() {
            var r = confirm('Please confirm that you want to delete this test subject.');
            if (r === true) {
              $.ajax({
                type: 'DELETE',
                url: 'api/test-subjects/id/' + $(this).closest('#infoSubject').attr('val'),
                headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                success: function() {
                  location.reload();
                },
              });
            }
          });
        }
      });
    } else {
      $('#infoSubject').html('');
    }
  });

  // Edit test subject
  $('#cardExistingSubject').on('click', '#editTestSubject', function() {
    $.get('api/test-subjects/id/' + $(this).closest('.card-body').find('#selectSubject').val(), function(subject) {
      $('#modalEdit .modal-body').html('' +
      '<div class="form-group">' +
        '<label for="inputNameEdit">Name</label>' +
        '<input type="text" id="inputNameEdit" class="form-control" value="' + subject.name + '" required>' +
      '</div>'
      );
      subject.configuration.forEach(function(config) {
        $('#modalEdit .modal-body').append('' +
        '<div class="form-group">' +
          '<div class="row config border-top">' +
            '<div class="col">' +
              '<label id="labelConfigNameEdit">Configuration name</label>' +
              '<input type="text" class="form-control inputConfigNameEdit" value="' + config.name + '" previousname="' + config.name + '" required>' +
              '<div class="makeLinkDisabledEdit">' +
                '<button type="button" class="btn btn-outline-primary" id="buttonMakeLinkEdit"><i class="fa fa-link"></i> Link</button>' +
                '<small class="form-text text-muted infoLink">' +
                  '<i class="fa fa-question-circle infoLinkIcon tooltipInfoLink" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" data-html="true" title="You can turn this configuration into a link.<br>' +
                  'Just specify the base URL, the value of the configuration will be added automatically at the end to create the link.<br><br>' +
                  '<strong>Example</strong><br>' +
                  'Configuration name: <i>Issue ID</i><br>' +
                  'Base URL: <i>https://redmine.aldebaran.lan/issues/</i><br>' +
                  'Configuration value: <i>42305</i><br>' +
                  'Link: <i>https://redmine.aldebaran.lan/issues/42305</i><br><br>' +
                  '<i class=&quot;fa fa-warning&quot; aria-hidden=&quot;true&quot;></i> Don\'t forget the &quot;/&quot; at the end of the base URL.">' +
                  '</i>' +
                '</small>' +
              '</div>' +
              '<div class="makeLinkEnabledEdit" style="display: none;">' +
                '<div class="row makeLink">' +
                  '<div class="col">' +
                    '<input class="form-control inputUrlBaseEdit" type="text" placeholder="Enter the base URL">' +
                  '</div>' +
                  '<div class="col-2">' +
                    '<button type="button" class="btn btn-warning deleteLink" id="deleteLinkEdit"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="col">' +
              '<label id="label' + config.name + '">Options</label>' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="col">' +
            '</div>' +
            '<div class="col">' +
              '<button type="button" class="btn btn-outline-danger float-right" id="deleteConfig"><i class="fa fa-times" aria-hidden="true"></i> Delete this configuration</button>' +
            '</div>' +
          '</div>' +
        '</div>');

        $('[data-toggle="tooltip"]').tooltip();

        // exisiting options
        if (config.options.length > 0) {
          config.options.forEach(function(option) {
            $('<input class="form-control inputOptionEdit" type="text" value="' + option + '">').insertAfter('#label'+config.name);
          });
        } else {
          $('<input class="form-control inputOptionEdit" type="text" value="">').insertAfter('#label'+config.name);
        }

        // exisiting links
        if (config.baseUrl) {
          $('.inputConfigNameEdit').each(function() {
            if ($(this).val() === config.name) {
              $(this).siblings('.makeLinkDisabledEdit').find('#buttonMakeLinkEdit').trigger('click');
              $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val(config.baseUrl);
            }
          });
        }
      });

      // button to add a new config
      $('<button type="button" class="btn btn-outline-primary" id="buttonMoreConfigEdit"><i class="fa fa-plus-circle"></i> Configuration</button>').insertAfter('#modalEdit .modal-body .form-group:last');
    });
  });

  // modal button listener (new config)
  $('#modalEdit .modal-body').on('click', '#buttonMoreConfigEdit', function() {
    if (!$(this).parent().find('.form-group:last').find('.inputConfigNameEdit').length > 0 || $(this).parent().find('.form-group:last').find('.inputConfigNameEdit').val().trim() !== '') {
      $('' +
      '<div class="form-group">' +
        '<div class="row config border-bottom">' +
          '<div class="col">' +
            '<label id="labelConfigNameEdit">Configuration name</label>' +
            '<input type="text" class="form-control inputConfigNameEdit newConfig" placeholder="Enter the name">' +
            '<div class="makeLinkDisabledEdit">' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMakeLinkEdit"><i class="fa fa-link"></i> Link</button>' +
            '</div>' +
            '<div class="makeLinkEnabledEdit" style="display: none;">' +
              '<div class="row makeLink">' +
                '<div class="col">' +
                  '<input class="form-control inputUrlBaseEdit" type="text" placeholder="Enter the base URL">' +
                '</div>' +
                '<div class="col-2">' +
                  '<button type="button" class="btn btn-warning deleteLink" id="deleteLinkEdit"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="col">' +
            '<label>Options</label>' +
            '<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option" style="margin-top: 0px;">' +
            '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
          '</div>' +
        '</div>' +
      '</div>').insertBefore('#buttonMoreConfigEdit');
    } else {
      showModal('Warning', 'Fulfill the actual configuration to add another.');
    }
  });

  // modal button listener (new option)
  $('#modalEdit .modal-body').on('click', '#buttonMoreOptionEdit', function() {
    if ($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      showModal('Warning', 'Fulfill the actual option to add another.');
    }
  });

  // modal button listener (delete config)
  $('#modalEdit .modal-body').on('click', '#deleteConfig', function() {
    var r = confirm('Are you sure you want to delete this configuration ? It won\'t affect the tests already stored');
    if (r === true) {
      $(this).closest('.form-group').remove();
    }
  });

  // modal button listener (link)
  $('#modalEdit .modal-body').on('click', '#buttonMakeLinkEdit', function() {
    $(this).closest('div').hide();
    $(this).closest('div').next().show();
  });

  // modal button listener (delete link)
  $('#modalEdit .modal-body').on('click', '#deleteLinkEdit', function() {
    $(this).closest('.makeLinkEnabledEdit').hide();
    $(this).closest('.makeLinkEnabledEdit').prev().show();
  });

  // modify configuration name on change
  $('#modalEdit .modal-body').on('change', '.inputConfigNameEdit', function() {
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
    $(this).val(name);
    $(this).addClass('nameChanged');
  });

  // modify option name on change
  $('#modalEdit .modal-body').on('change', '.inputOptionEdit', function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  // Submit event when editing a subject
  $('.form-edit').submit(function(e) {
    e.preventDefault();
    var r = confirm('⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️\n\nThis will modify all the associated tests ! If you deleted some configurations, they will stay in the tests.\nPlease confirm that you want to modify this test subject.');
    if (r === true) {
      var editedSubject = {
        name: $('#inputNameEdit').val().replace(/\s+/g, ' '),
        configuration: [],
      };
      if ($('.inputConfigNameEdit').length > 0) {
        $('.inputConfigNameEdit').each(function() {
          if (!$(this).hasClass('newConfig') || ($(this).hasClass('newConfig') && $(this).val().trim() !== '')) {
            var config = {
              name: $(this).val(),
              options: [],
            };
            // add options
            $(this).closest('.form-group').find('.inputOptionEdit').each(function() {
              if ($(this).val().trim() !== '') {
                config.options.push($(this).val());
              }
            });
            // add base URL
            if ($(this).siblings('.makeLinkEnabledEdit').is(':visible') && $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val().trim() !== '') {
              config.baseUrl = $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val().trim();
            }
            editedSubject.configuration.push(config);
          }
        });
      } else {
        editedSubject.emptyConfiguration = true;
      }

      $.ajax({
        method: 'POST',
        url: 'api/test-subjects/id/' + $('#infoSubject').attr('val'),
        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
        data: editedSubject,
        success: function(data) {
          if (data.name === 'Success') {
            // modify all the associated tests
            $.post('api/tests', {testSubjectId: $('#infoSubject').attr('val')}, function(tests) {
              new Promise(function(resolve, reject) {
                if (tests.length > 0) {
                  if (subjectNameChanged(data.before, data.modified)) {
                    $.ajax({
                      method: 'POST',
                      url: 'api/tests/changeTestSubjectName',
                      headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                      data: {previousName: data.before.name, newName: data.modified.name},
                      success: function(data) {
                        console.log(data);
                      },
                    });
                  }
                  // handle changes on configuration
                  $('.inputConfigNameEdit').each(function() {
                    if ($(this).hasClass('newConfig') && $(this).val().trim() !== '') {
                      // add this config to all tests with the associated subject
                      var body = {
                        subject: editedSubject.name,
                        config: {
                          name: $(this).val().trim(),
                          value: '',
                        },
                      };
                      $.ajax({
                        method: 'POST',
                        url: 'api/tests/addConfig',
                        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                        data: body,
                        success: function(data) {
                          console.log(data);
                        },
                      });
                    } else if ($(this).hasClass('nameChanged') && $(this).val().trim() !== '') {
                      // change this config name on all tests with the associated subject
                      var body = {
                        subject: editedSubject.name,
                        previousName: $(this).attr('previousname'),
                        newName: $(this).val().trim(),
                      };
                      $.ajax({
                        method: 'POST',
                        url: 'api/tests/changeConfigName',
                        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                        data: body,
                        success: function(data) {
                          console.log(data);
                        },
                      });
                    }
                  });
                }
              }).then(location.reload());
            });
          } else {
            showModal('Error', 'Someting went wrong.');
          }
        },
      });
    }
  });

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

  function isMaster() {
    var res = false;
    $.ajax({
      type: 'GET',
      url: 'api/user/profile',
      async: false,
      success: function(user) {
        res = user.master;
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

  function subjectNameChanged(testSubjectBefore, testSubjectAfter) {
    if (testSubjectBefore.name !== testSubjectAfter.name) {
      return true;
    } else {
      return false;
    }
  }

  function showModal(title, message) {
    $('#myModal .modal-header').html('<h4 class="modal-title">' + title + '</h4>');
    $('#myModal .modal-body').html('<p>' + message + '<p>');
    $('#myModal').modal('show');
  }
})(jQuery);
