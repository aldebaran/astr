(function($) {
  'use strict';

  if (!isMaster()) {
    showModal('Information', 'Welcome on the Archive Category page !<br><br>Since you are not a Master, you won\'t be able to modify or create new archive categories. But you can still take a look at the existing categories.');
  }

  // Create a new archive category
  $('#buttonMoreDescriptor').click(function() {
    // check if the last descriptor row is not empty
    if ($('.inputDescriptorName:last').val().trim() !== '') {
      $('#formDescriptor').append('' +
      '<div class="form-group">' +
        '<div class="row descriptor border-bottom">' +
          '<div class="col">' +
            '<label id="labelDescriptorName">Descriptor name</label>' +
            '<input type="text" class="form-control inputDescriptorName" placeholder="Enter the descriptor name">' +
            '<div class="makeLinkDisabled">' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMakeLink"><i class="fa fa-link"></i> Link</button>' +
              '<small class="text-muted infoLink">' +
                '<i class="fa fa-question-circle infoLinkIcon tooltipInfoLink" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" data-html="true" title="You can turn this descriptor into a link.<br>' +
                'Just specify the base URL, the value of the descriptor will be added automatically at the end to create the link.<br><br>' +
                '<strong>Example</strong><br>' +
                'Descriptor name: <i>Issue ID</i><br>' +
                'Base URL: <i>https://redmine.aldebaran.lan/issues/</i><br>' +
                'Descriptor value: <i>42305</i><br>' +
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
      showModal('Warning', 'Fulfill the current descriptor input to add another.');
    }
  });

  $('#formDescriptor').on('click', '#buttonMoreOption', function() {
    // check if the last option row is not empty
    if ($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOption" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      showModal('Warning', 'Fulfill the current option to add another.');
    }
  });

  $('#formDescriptor').on('click', '#buttonMakeLink', function() {
    $(this).closest('div').hide();
    $(this).closest('div').next().show();
  });

  $('#formDescriptor').on('click', '#deleteLink', function() {
    $(this).closest('.makeLinkEnabled').hide();
    $(this).closest('.makeLinkEnabled').prev().show();
  });

  // modify category name
  $('#inputName').change(function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  // modify the descriptor name
  $('#submitNewCategory').on('change', '.inputDescriptorName', function() {
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
    $(this).val(name);
  });

  // modify option name on change
  $('#submitNewCategory').on('change', '.inputOption', function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  $('#submitNewCategory').submit(function(e) {
    e.preventDefault();

    // if the user is logged and is master
    if (isConnected() && isMaster()) {
      var r = confirm('Please confirm that you want to add this new archive category.');
      if (r === true) {
        var category = {
          name: $('#inputName').val().trim().replace(/\s+/g, ' '),
          author: getUserName(),
          descriptors: [],
        };
        $('.inputDescriptorName').each(function() {
          var descriptorName = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
          var options = [];
          $(this).closest('.row').find('.inputOption').each(function() {
            if ($(this).val().trim() !== '') {
              options.push($(this).val().trim().toUpperCase().replace(/\s+/g, ' '));
            }
          });
          if (descriptorName !== '') {
            if ($(this).siblings('.makeLinkEnabled').is(':visible') && $(this).siblings('.makeLinkEnabled').find('.inputUrlBase').val().trim() !== '') {
              // descriptor with link
              category.descriptors.push({
                name: descriptorName,
                options: options,
                baseUrl: $(this).siblings('.makeLinkEnabled').find('.inputUrlBase').val().trim(),
              });
            } else {
              // simple descriptor
              category.descriptors.push({
                name: descriptorName,
                options: options,
              });
            }
          }
        });

        // send the new category
        $.ajax({
          method: 'POST',
          url: 'api/categories',
          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
          data: category,
          success: function() {
            location.reload();
          },
        });
      }
    } else if (isConnected()) {
      // if the user is logged but without permission
      showModal('Error', 'Sorry, you don\'t have the authorization to create new archive categories. Please contact an admin to modify your privileges.<br><br>Admins:<br>' + getMasterList().replace(/\n/g, '<br>'));
    } else {
      // if the user isn't logged
      showModal('Error', 'Please log in to create a new archive category !');
    }
  });


  // Existing categories
  $.get('api/categories', function(categories) {
    categories.forEach(function(category) {
      $('#selectCategory').append('<option value="' + category._id + '">' + category.name + '</option>');
    });
  });

  $('#selectCategory').change(function() {
    if ($('#selectCategory').val() !== 'default') {
      $.get('api/categories/id/' + $('#selectCategory').val(), function(data) {
        $('#infoCategory').attr('val', data._id);
        $('#infoCategory').html('' +
        '<span class="key"> Name: </span><span class="value">' + data.name + '</span><br>' +
        '<span class="key"> Author: </span><span class="value" id="categoryAuthor">' + data.author + '</span><br>' +
        '<span class="key"> Created: </span><span class="value">' + new Date(data.created).toLocaleDateString() + '</span><br>' +
        '<span class="key"> Descriptors</span><br>');
        data.descriptors.forEach(function(descriptor) {
          if (descriptor.options.length > 0 && descriptor.baseUrl) {
            $('#infoCategory').append('<li class="descriptor"><span><i class="fa fa-link" aria-hidden="true"></i> ' + descriptor.name + '</span><span class="value"> <a href="' + descriptor.baseUrl + '">(' + descriptor.baseUrl + '[:' + descriptor.name + '])</a> [' + descriptor.options.join(', ') + ']' + '</span></li>');
          } else if (descriptor.options.length > 0) {
            $('#infoCategory').append('<li class="descriptor"><span>' + descriptor.name + '</span><span class="value"> [' + descriptor.options.join(', ') + ']' + '</span></li>');
          } else if (descriptor.baseUrl) {
            $('#infoCategory').append('<li class="descriptor"><span><i class="fa fa-link" aria-hidden="true"></i> ' + descriptor.name + '</span><span class="value"> <a href="' + descriptor.baseUrl + '">(' + descriptor.baseUrl + '[:' + descriptor.name + '])</a></span></li>');
          } else {
            $('#infoCategory').append('<li class="descriptor"><span>' + descriptor.name + '</span></li>');
          }
        });

        // master can delete and edit the category
        if (isMaster()) {
          $('#infoCategory').append('' +
            '<div class="button-footer">' +
              '<button type="button" class="btn btn-danger admin-user" id="deleteArchiveCategory"><i class="fa fa-times" aria-hidden="true"></i> Delete</button>' +
              '<button type="button" class="btn btn-info admin-user" id="editArchiveCategory" data-toggle="modal" data-target="#modalEdit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</button>' +
            '</div>'
          );

          $('#deleteArchiveCategory').click(function() {
            var r = confirm('⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️\nIf you delete this archive, all the links will be broken and not usable anymore. Are you sure you want to delete this archive category ?');
            if (r === true) {
              $.ajax({
                type: 'DELETE',
                url: 'api/categories/id/' + $(this).closest('#infoCategory').attr('val'),
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
      $('#infoCategory').html('');
    }
  });

  // Edit archive category
  $('#cardExisitingCategory').on('click', '#editArchiveCategory', function() {
    $.get('api/categories/id/' + $(this).closest('.card-body').find('#selectCategory').val(), function(category) {
      $('#modalEdit .modal-body').html('' +
      '<div class="form-group">' +
        '<label for="inputNameEdit">Name</label>' +
        '<input type="text" id="inputNameEdit" class="form-control" value="' + category.name + '" required>' +
      '</div>'
      );
      category.descriptors.forEach(function(descriptor) {
        $('#modalEdit .modal-body').append('' +
        '<div class="form-group">' +
          '<div class="row descriptor border-top">' +
            '<div class="col">' +
              '<label id="labelDescriptorNameEdit">Descriptor name</label>' +
              '<input type="text" class="form-control inputDescriptorNameEdit" value="' + descriptor.name + '" previousname="' + descriptor.name + '" required>' +
              '<div class="makeLinkDisabledEdit">' +
                '<button type="button" class="btn btn-outline-primary" id="buttonMakeLinkEdit"><i class="fa fa-link"></i> Link</button>' +
                '<small class="text-muted infoLink">' +
                  '<i class="fa fa-question-circle infoLinkIcon tooltipInfoLink" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" data-html="true" title="You can turn this descriptor into a link.<br>' +
                  'Just specify the base URL, the value of the descriptor will be added automatically at the end to create the link.<br><br>' +
                  '<strong>Example</strong><br>' +
                  'Descriptor name: <i>Issue ID</i><br>' +
                  'Base URL: <i>https://redmine.aldebaran.lan/issues/</i><br>' +
                  'Descriptor value: <i>42305</i><br>' +
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
              '<label id="label' + descriptor.name + '">Options</label>' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="col">' +
            '</div>' +
            '<div class="col">' +
              '<button type="button" class="btn btn-outline-danger float-right" id="deleteDescriptor"><i class="fa fa-times" aria-hidden="true"></i> Delete this descriptor</button>' +
            '</div>' +
          '</div>' +
        '</div>');

        $('[data-toggle="tooltip"]').tooltip();

        // exisiting options
        if (descriptor.options.length > 0) {
          descriptor.options.forEach(function(option) {
            $('<input class="form-control inputOptionEdit" type="text" value="' + option + '">').insertAfter('#label'+descriptor.name);
          });
        } else {
          $('<input class="form-control inputOptionEdit" type="text" value="">').insertAfter('#label'+descriptor.name);
        }

        // exisiting links
        if (descriptor.baseUrl) {
          $('.inputDescriptorNameEdit').each(function() {
            if ($(this).val() === descriptor.name) {
              $(this).siblings('.makeLinkDisabledEdit').find('#buttonMakeLinkEdit').trigger('click');
              $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val(descriptor.baseUrl);
            }
          });
        }
      });

      // button to add a new descriptor
      $('<button type="button" class="btn btn-outline-primary" id="buttonMoreDescriptorEdit"><i class="fa fa-plus-circle"></i> Descriptor</button>').insertAfter('#modalEdit .modal-body .form-group:last');
    });
  });

  // modal button listener (new descriptor)
  $('#modalEdit .modal-body').on('click', '#buttonMoreDescriptorEdit', function() {
    if (!$(this).parent().find('.form-group:last').find('.inputDescriptorNameEdit').length > 0 || $(this).parent().find('.form-group:last').find('.inputDescriptorNameEdit').val().trim() !== '') {
      $('' +
      '<div class="form-group">' +
        '<div class="row descriptor border-bottom">' +
          '<div class="col">' +
            '<label id="labelDescriptorNameEdit">Descriptor name</label>' +
            '<input type="text" class="form-control inputDescriptorNameEdit newDescriptor" placeholder="Enter the name">' +
            '<div class="makeLinkDisabledEdit">' +
              '<button type="button" class="btn btn-outline-primary" id="buttonMakeLinkEdit"><i class="fa fa-link"></i> Link</button>' +
              '<small class="text-muted infoLink">' +
                '<i class="fa fa-question-circle infoLinkIcon tooltipInfoLink" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" data-html="true" title="You can turn this descriptor into a link.<br>' +
                'Just specify the base URL, the value of the descriptor will be added automatically at the end to create the link.<br><br>' +
                '<strong>Example</strong><br>' +
                'Descriptor name: <i>Issue ID</i><br>' +
                'Base URL: <i>https://redmine.aldebaran.lan/issues/</i><br>' +
                'Descriptor value: <i>42305</i><br>' +
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
            '<label>Options</label>' +
            '<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option" style="margin-top: 0px;">' +
            '<button type="button" class="btn btn-outline-primary" id="buttonMoreOptionEdit"><i class="fa fa-plus-circle"></i> Option</button>' +
          '</div>' +
        '</div>' +
      '</div>').insertBefore('#buttonMoreDescriptorEdit');
      $('[data-toggle="tooltip"]').tooltip();
    } else {
      showModal('Warning', 'Fulfill the current descriptor to add another.');
    }
  });

  // modal button listener (new option)
  $('#modalEdit .modal-body').on('click', '#buttonMoreOptionEdit', function() {
    if ($(this).parent().find('input:last').val().trim() !== '') {
      $('<input class="form-control inputOptionEdit" type="text" placeholder="Enter an option">').insertBefore(this);
    } else {
      showModal('Warning', 'Fulfill the current option to add another.');
    }
  });

  // modal button listener (delete descriptor)
  $('#modalEdit .modal-body').on('click', '#deleteDescriptor', function() {
    var r = confirm('Are you sure you want to delete this descriptor ? It won\'t affect the archives already stored');
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

  // modify descriptor name on change
  $('#modalEdit .modal-body').on('change', '.inputDescriptorNameEdit', function() {
    var name = $(this).val().trim().toLowerCase().replace(/\s+/g, '_');
    $(this).val(name);
    $(this).addClass('nameChanged');
  });

  // modify option name on change
  $('#modalEdit .modal-body').on('change', '.inputOptionEdit', function() {
    var name = $(this).val().trim().toUpperCase().replace(/\s+/g, ' ');
    $(this).val(name);
  });

  // Submit event when editing a category
  $('.form-edit').submit(function(e) {
    e.preventDefault();
    var r = confirm('⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️\n\nThis will modify all the associated archives ! If you deleted some descriptors, they will stay in the archives.\nPlease confirm that you want to modify this archive category.');
    if (r === true) {
      var editedCategory = {
        name: $('#inputNameEdit').val().replace(/\s+/g, ' '),
        descriptors: [],
      };
      if ($('.inputDescriptorNameEdit').length > 0) {
        $('.inputDescriptorNameEdit').each(function() {
          if (!$(this).hasClass('newDescriptor') || ($(this).hasClass('newDescriptor') && $(this).val().trim() !== '')) {
            var descriptor = {
              name: $(this).val(),
              options: [],
            };
            // add options
            $(this).closest('.form-group').find('.inputOptionEdit').each(function() {
              if ($(this).val().trim() !== '') {
                descriptor.options.push($(this).val());
              }
            });
            // add base URL
            if ($(this).siblings('.makeLinkEnabledEdit').is(':visible') && $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val().trim() !== '') {
              descriptor.baseUrl = $(this).siblings('.makeLinkEnabledEdit').find('.inputUrlBaseEdit').val().trim();
            }
            editedCategory.descriptors.push(descriptor);
          }
        });
      } else {
        editedCategory.noDescriptors = true;
      }

      $.ajax({
        method: 'POST',
        url: 'api/categories/id/' + $('#infoCategory').attr('val'),
        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
        data: editedCategory,
        success: function(data) {
          if (data.name === 'Success') {
            // modify all the associated archives
            $.post('api/archives', {archiveCategoryId: $('#infoCategory').attr('val')}, function(archives) {
              if (archives.length > 0) {
                // FIRST, change the category name in all archives if it has changed
                new Promise(function(resolve) {
                  if (categoryNameChanged(data.before, data.modified)) {
                    $.ajax({
                      method: 'POST',
                      url: 'api/archives/changeArchiveCategoryName',
                      headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                      data: {previousName: data.before.name, newName: data.modified.name},
                      success: function(data) {
                        console.log(data);
                        resolve();
                      },
                    });
                  } else {
                    resolve();
                  }
                }).then(function() {
                  // THEN, handle changes on descriptors
                  Promise.all($('.inputDescriptorNameEdit').map(function(idx) {
                    return new Promise(function(resolve) {
                      if ($('.inputDescriptorNameEdit').eq(idx).hasClass('newDescriptor') && $('.inputDescriptorNameEdit').eq(idx).val().trim() !== '') {
                        // add this descriptor to all archives with the associated category
                        var body = {
                          category: editedCategory.name,
                          descriptor: {
                            name: $('.inputDescriptorNameEdit').eq(idx).val().trim(),
                            value: '',
                          },
                        };
                        $.ajax({
                          method: 'POST',
                          url: 'api/archives/addDescriptor',
                          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                          data: body,
                          success: function(data) {
                            console.log(data);
                            resolve();
                          },
                        });
                      } else if ($('.inputDescriptorNameEdit').eq(idx).hasClass('nameChanged') && $('.inputDescriptorNameEdit').eq(idx).val().trim() !== '') {
                        // change this descriptor name on all archives with the associated category
                        var body = {
                          category: editedCategory.name,
                          previousName: $('.inputDescriptorNameEdit').eq(idx).attr('previousname'),
                          newName: $('.inputDescriptorNameEdit').eq(idx).val().trim(),
                        };
                        $.ajax({
                          method: 'POST',
                          url: 'api/archives/changeDescriptorName',
                          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                          data: body,
                          success: function(data) {
                            console.log(data);
                            resolve();
                          },
                        });
                      } else {
                        resolve();
                      }
                    });
                  })).then(function() {
                    location.reload();
                  });
                });
              } else {
                location.reload();
              }
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

  function categoryNameChanged(categoryBefore, categoryAfter) {
    if (categoryBefore.name !== categoryAfter.name) {
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
