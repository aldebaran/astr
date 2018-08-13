(function($) {
  'use strict';

  // ------------------------------ Search -------------------------------- //

  // get all archive authors
  $.get('api/archives/authors', function(authors) {
    authors.forEach(function(author) {
      $('#selectAuthor').append('<option>' + author + '</option>');
    });
  });
  // get all archive categories
  $.get('api/archives/categories', function(categories) {
    categories.forEach(function(category) {
      $('#selectCategory').append('<option>' + category + '</option>');
    });
  });
  // get all archive descriptors
  $.get('api/archives/descriptors', function(descriptors) {
    descriptors.forEach(function(descriptor) {
      $('#selectDescriptor').append('<option value="' + descriptor + '">Add a filter on ' + descriptor + '</option>');
    });
  });

  // action search when the search-box changes
  $('#form-search').change(function() {
    // create the body request
    var bodyRequest = {
      '$and': [],
      '_id': {
        '$in': [],
      },
    };
    // add the author to the body request
    if ($('#selectAuthor').val() !== 'default') {
      bodyRequest.author = $('#selectAuthor').val();
    }
    // add the archive category to the body request
    if ($('#selectCategory').val() !== 'default') {
      bodyRequest.category = $('#selectCategory').val();
    }
    // add the date to the body request
    if ($('#inputDate').val() !== '') {
      if ($('#checkboxDateRange').is(':checked') && $('#inputDate2').val() !== '') {
        // date range
        bodyRequest.date = [
          $('#inputDate').val(),
          $('#inputDate2').val(),
        ];
      } else {
        // unique date
        bodyRequest.date = $('#inputDate').val();
      }
    }
    // add the IDs to the body request
    if ($('#inputIds').val().trim() !== '') {
      var ids = $('#inputIds').val().split(',').map((id) => id.trim());
      var checkForHexRegExp = /^[a-f\d]{24}$/i;
      ids.forEach(function(id) {
        if (checkForHexRegExp.test(id)) {
          bodyRequest._id['$in'].push(id);
        } else if (id !== '') {
          showModal('Warning', id + ' is not a valid ID');
        }
      });
    }
    // add the descriptors to the body request
    $('.inputDescriptor').each(function() {
      if ($(this).val() === 'regex' && $(this).next().find('.inputDescriptorRegex').val() !== '') {
        bodyRequest['$and'].push({
          'descriptors': {
            '$elemMatch': {
              'name': $(this).closest('.form-group').find('label').html(),
              'value': {
                '$regex': $(this).next().find('.inputDescriptorRegex').val(),
              },
            },
          },
        });
        console.log($(this).next().find('.inputDescriptorRegex').val());
      } else if ($(this).val() !== '' && $(this).val() !== 'regex') {
        bodyRequest['$and'].push({
          'descriptors': {
            '$elemMatch': {
              'name': $(this).closest('.form-group').find('label').html(),
              'value': $(this).val(),
            },
          },
        });
      }
    });

    if (bodyRequest['$and'].length === 0) {
      delete bodyRequest['$and'];
    }
    if (bodyRequest._id['$in'].length === 0) {
      delete bodyRequest._id;
    }
    // execute the search each time the box search content change
    search(bodyRequest, 1);
  });

  $('#selectCategory').change(function() {
    if ($('#selectCategory').val() !== 'default') {
      // select only the descriptors of the archive category
      $.get('api/archives/descriptors/' + $('#selectCategory').val(), function(descriptors) {
        $('#selectDescriptor').html('<option value="default">Click here to add filters</option>');
        descriptors.forEach(function(descriptor) {
          $('#selectDescriptor').append('<option value="' + descriptor + '">Add a filter on ' + descriptor + '</option>');
        });
      });
    } else {
      $.get('api/archives/descriptors', function(descriptors) {
        $('#selectDescriptor').html('<option value="default">Click here to add filters</option>');
        descriptors.forEach(function(descriptor) {
          $('#selectDescriptor').append('<option value="' + descriptor + '">Add a filter on ' + descriptor + '</option>');
        });
      });
    }

    // delete existing descriptors
    $('.descriptor-group').each(function() {
      $(this).remove();
    });
    selectedDescriptor = [];
  });

  $('#form-search').submit(function(e) {
    e.preventDefault();
  });

  // add input when a new descriptor is selected
  var selectedDescriptor = [];
  $('#selectDescriptor').change(function() {
    if ($('#selectDescriptor').val() !== 'default' && !selectedDescriptor.includes($('#selectDescriptor').val())) {
      selectedDescriptor.push($('#selectDescriptor').val());
      $('#form-search').append('' +
      '<div class="form-group descriptor-group">' +
        '<label class="labelDescriptor">' + $('#selectDescriptor').val() + '</label>' +
        '<div class="row">' +
          '<div class="col">' +
            '<select class="form-control inputDescriptor">' +
              '<option></option>' +
            '</select>' +
          '</div>' +
          '<div class="col-2">' +
            '<button type="button" class="btn btn-warning deleteDescriptor" id="deleteDescriptor"><i class="fa fa-times" aria-hidden="true"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>'
      );
      $.get('/api/archives/options/' + $('#selectDescriptor').val(), function(options) {
        options.forEach(function(option) {
          $('.inputDescriptor:last').append('<option>' + option + '</option>');
        });
        $('.inputDescriptor:last').append('<option value="regex">Use a regex</option>');
        $('#selectDescriptor').val('default');
      });
    } else {
      $('#selectDescriptor').val('default');
    }
  });

  // delete descriptor input
  $('#form-search').on('click', '.deleteDescriptor', function() {
    // remove descriptor from the array
    selectedDescriptor.splice(selectedDescriptor.indexOf($(this).closest('.form-group').find('label').html()), 1);
    // remove descriptor input from the page
    $(this).closest('.form-group').remove();
    $('#form-search').trigger('change');
  });

  // add input for regex
  $('#form-search').on('change', '.inputDescriptor', function() {
    if ($(this).val() === 'regex') {
      $('' +
      '<div class="input-group mb-3 regexGroup">' +
        '<input type="text" class="form-control inputDescriptorRegex" placeholder="Regex">' +
        '<div class="input-group-append">' +
          '<a href="https://www.debuggex.com/cheatsheet/regex/pcre" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><i class="fa fa-question-circle" aria-hidden="true"></i></a>' +
        '</div>' +
      '</div>').insertAfter(this);
    } else if ($(this).next().hasClass('regexGroup')) {
      $(this).next().remove();
    }
  });

  // range of dates
  $('#checkboxDateRange').click(function() {
    if ($(this).is(':checked')) {
      $(this).next().removeClass('text-secondary');
      $('#dateFromTo').show();
      if ($('#inputDate').val()) {
        $('#inputDate2').prop('disabled', false);
      }
    } else {
      $(this).next().addClass('text-secondary');
      $('#dateFromTo').hide();
    }
  });

  // enable second date
  $('#inputDate').change(function() {
    if ($(this).val()) {
      $('#inputDate2').prop('disabled', false);
      $('#inputDate2').attr('min', $(this).val());
    } else {
      $('#inputDate2').prop('disabled', true);
    }
  });

  /**
   * Search archives in function of body and page
   * @param {object} body
   * @param {string} page
   */
  function search(body, page) {
    var resultPerPage = 30;
    $.post('api/archives/page/' + page + '/' + resultPerPage, body, function(archives) {
      var matchedArchives = [];
      $('#archives-grid').html('');
      if (isConnected() && isMaster()) {
        // if the user is Master
        archives.forEach(function(archive) {
          matchedArchives.push(archive._id);
          $('#archives-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + archive._id + '">' +
            '<div class="card-header">'+ archive.category + ' <span class="archiveNumber"></span></div>' +
            '<div class="card-body archives" id="body' + archive._id + '">' +
              '<div><span class="key">Author: </span><span class="value">' + archive.author + '</span></div>' +
              '<div><span class="key">Date: </span><span class="value">' + archive.date.substr(0, 10) + '</span></div>' +
              '<div class="comments" style="display: none;"><span class="key">Comments: </span><span class="value">' + archive.comments + '</span></div>' +
            '</div>' +
            '<div class="card-footer small text-muted" id="footer' + archive._id + '"><div id="info-footer">id: ' + archive._id + '<br> last modification: ' + new Date(archive.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + archive._id + '">' +
                '<button type="button" class="btn btn-danger admin-user" id="deleteArchive"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
                '<button type="button" class="btn btn-info admin-user" id="editArchive" data-toggle="modal" data-target="#modalEdit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + archive._id + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
                '<a class="btn btn-secondary download-button-lock" style="display: none;" data-toggle="tooltip" data-html="true" title="The archive is being zipped, and it may take some time.<br>Try to refresh the page later."><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          if (archive.isDownloadable === false) {
            $('#' + archive._id).find('.download-button').hide();
            $('#' + archive._id).find('.download-button-lock').show();
            $('#' + archive._id).find('.download-button-lock').tooltip();
          }

          $.get('api/categories/links/' + archive.category, function(links) {
            archive.descriptors.forEach(function(descriptor) {
              if (links[descriptor.name]) {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName"><i class="fa fa-link" aria-hidden="true"></i> ' + descriptor.name + ': </span><a target="_blank" rel="noopener noreferrer" href="' + links[descriptor.name] + descriptor.value + '">' + descriptor.value + '</a></li>');
              } else {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName">' + descriptor.name + ':</span><span class="value"> ' + descriptor.value + '</span></li>');
              }
            });
          });

          if (archive.comments) {
            $('#body'+archive._id+' .comments').show();
          }
        });
      } else if (isConnected()) {
        // if the user is connected but not a master --> can only modify his own archives
        const username = getUserName();
        archives.forEach(function(archive) {
          matchedArchives.push(archive._id);
          $('#archives-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + archive._id + '">' +
            '<div class="card-header">'+ archive.category + ' <span class="archiveNumber"></span></div>' +
            '<div class="card-body archives" id="body' + archive._id + '">' +
              '<div><span class="key">Author: </span><span class="value">' + archive.author + '</span></div>' +
              '<div><span class="key">Date: </span><span class="value">' + archive.date.substr(0, 10) + '</span></div>' +
              '<div class="comments" style="display: none;"><span class="key">Comments: </span><span class="value">' + archive.comments + '</span></div>' +
            '</div>' +
            '<div class="card-footer small text-muted"><div id="info-footer">id: ' + archive._id + '<br> last modification: ' + new Date(archive.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + archive._id + '">' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + archive._id + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
                '<a class="btn btn-secondary download-button-lock" style="display: none;" data-toggle="tooltip" data-html="true" title="The archive is being zipped, and it may take some time.<br>Try to refresh the page later."><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          if (archive.isDownloadable === false) {
            $('#' + archive._id).find('.download-button').hide();
            $('#' + archive._id).find('.download-button-lock').show();
            $('#' + archive._id).find('.download-button-lock').tooltip();
          }

          $.get('api/categories/links/' + archive.category, function(links) {
            archive.descriptors.forEach(function(descriptor) {
              if (links[descriptor.name]) {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName"><i class="fa fa-link" aria-hidden="true"></i> ' + descriptor.name + ': </span><a target="_blank" rel="noopener noreferrer" href="' + links[descriptor.name] + descriptor.value + '">' + descriptor.value + '</a></li>');
              } else {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName">' + descriptor.name + ':</span><span class="value"> ' + descriptor.value + '</span></li>');
              }
            });
          });

          if (archive.comments) {
            $('#body'+archive._id+' .comments').show();
          }

          if (username === archive.author) {
            $('#button-footer'+archive._id).html('' +
            '<button type="button" class="btn btn-danger admin-user" id="deleteArchive"><i class="fa fa-trash" aria-hidden="true"></i></button>' +
            '<button type="button" class="btn btn-info admin-user" id="editArchive" data-toggle="modal" data-target="#modalEdit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>' +
            '<a class="btn btn-success download-button" href="/api/download/id/' + archive._id + '"><i class="fa fa-download" aria-hidden="true"></i></a>');
          }
        });
      } else {
        // if the user isn't logged
        archives.forEach(function(archive) {
          matchedArchives.push(archive._id);
          $('#archives-grid').append('<div class="col-sm-4"><div class="card mb-3" id="' + archive._id + '">' +
            '<div class="card-header">'+ archive.category + ' <span class="archiveNumber"></span></div>' +
            '<div class="card-body archives" id="body' + archive._id + '">' +
              '<div><span class="key">Author: </span><span class="value">' + archive.author + '</span></div>' +
              '<div><span class="key">Date: </span><span class="value">' + archive.date.substr(0, 10) + '</span></div>' +
              '<div class="comments" style="display: none;"><span class="key">Comments: </span><span class="value">' + archive.comments + '</span></div>' +
            '</div>' +
            '<div class="card-footer small text-muted" id="footer' + archive._id + '"><div id="info-footer">id: ' + archive._id + '<br> last modification: ' + new Date(archive.lastModification).toLocaleDateString() + '</div>' +
              '<div class="button-footer" id="button-footer' + archive._id + '">' +
                '<a class="btn btn-success download-button" href="/api/download/id/' + archive._id + '"><i class="fa fa-download" aria-hidden="true"></i></a>' +
                '<a class="btn btn-secondary download-button-lock" style="display: none;" data-toggle="tooltip" data-html="true" title="The archive is being zipped, and it may take some time.<br>Try to refresh the page later."><i class="fa fa-download" aria-hidden="true"></i></a>' +
              '</div>' +
            '</div>' +
          '</div></div>');

          if (archive.isDownloadable === false) {
            $('#' + archive._id).find('.download-button').hide();
            $('#' + archive._id).find('.download-button-lock').show();
            $('#' + archive._id).find('.download-button-lock').tooltip();
          }

          $.get('api/categories/links/' + archive.category, function(links) {
            archive.descriptors.forEach(function(descriptor) {
              if (links[descriptor.name]) {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName"><i class="fa fa-link" aria-hidden="true"></i> ' + descriptor.name + ': </span><a target="_blank" rel="noopener noreferrer" href="' + links[descriptor.name] + descriptor.value + '">' + descriptor.value + '</a></li>');
              } else {
                $('#body'+archive._id).append('<li class="descriptor"><span class="descriptorName">' + descriptor.name + ':</span><span class="value"> ' + descriptor.value + '</span></li>');
              }
            });
          });

          if (archive.comments) {
            $('#body'+archive._id+' .comments').show();
          }
        });
      }

      // display number of results
      $.post('api/archives', body, function(totalArchives) {
        if (totalArchives.length > 1) {
          $('#header-result').html('' +
          '<div class="card mb-3">' +
            '<div class="card-header">' +
              '<div class="row">' +
                '<div class="col-6">' +
                  '<h5>' + totalArchives.length + ' archives found</h5>' +
                  '<span id="itemOnPage"></span>' +
                '</div>' +
                '<div class="col-6">'+
                  '<button id="buttonDownloadAll" class="btn btn-success"><i class="fa fa-download" aria-hidden="true"></i> Download All</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>');
        } else if (totalArchives.length === 1) {
          $('#header-result').html('' +
          '<div class="card mb-3">' +
            '<div class="card-header">' +
              '<div class="row">' +
                '<div class="col-6">' +
                  '<h5>' + totalArchives.length + ' archive found</h5>' +
                '</div>' +
                '<div class="col-6">'+
                  '<button id="buttonDownloadAll" class="btn btn-success"><i class="fa fa-download" aria-hidden="true"></i> Download All</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>');
        } else {
          $('#header-result').html('' +
          '<div class="card mb-3">' +
            '<div class="card-header">' +
              '<div class="row">' +
                '<div class="col-6">' +
                  '<h5>No archive found</h5>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>');
        }

        // "Download All" button handler
        $('#buttonDownloadAll').click(function() {
          $('#waitDialog').modal('show');
          $('#waitDialog').modal({
            backdrop: 'static',
            keyboard: false,
          });
          $.post('api/download/multiple', {ids: matchedArchives}, function(data) {
            window.location.href = 'api/download/id/multiple';
            var timer = window.setInterval(function() {
              clearInterval(timer);
              $('#waitDialog').modal('hide');
            }, 1000);
          });
        });

        // ------------------------- Pagination ---------------------------- //

        var numberOfPages = Math.ceil(totalArchives.length / resultPerPage);
        var from = resultPerPage * page - resultPerPage + 1;
        var to = resultPerPage * page;
        if (to < totalArchives.length) {
          $('#itemOnPage').html(from + ' - ' + to + ' (Page ' + page + '/' + numberOfPages + ')');
        } else {
          $('#itemOnPage').html(from + ' - ' + totalArchives.length + ' (Page ' + page + '/' + numberOfPages + ')');
        }

        $('.archiveNumber').each(function(idx) {
          $(this).html('#' + (from+idx));
        });


        $('.pagination').html('');
        if (numberOfPages > 1) {
          for (var i=1; i<=numberOfPages; i++) {
            $('.pagination').append('<li class="page-item" id="page-item' + i + '"><a class="page-link">' + i + '</a></li>');
          }
        }
        $('#page-item' + page).addClass('active');

        $('#pagination').on('click', '.page-link', function() {
          // get the filters
          var bodyRequest = {
            '$and': [],
            '_id': {
              '$in': [],
            },
          };
          if ($('#selectAuthor').val() !== 'default') {
            bodyRequest.author = $('#selectAuthor').val();
          }
          if ($('#selectCategory').val() !== 'default') {
            bodyRequest.category = $('#selectCategory').val();
          }
          if ($('#inputDate').val() !== '') {
            if ($('#checkboxDateRange').is(':checked') && $('#inputDate2').val() !== '') {
              // date range
              bodyRequest.date = [
                $('#inputDate').val(),
                $('#inputDate2').val(),
              ];
            } else {
              // unique date
              bodyRequest.date = $('#inputDate').val();
            }
          }
          if ($('#inputIds').val().trim() !== '') {
            var ids = $('#inputIds').val().split(',').map((id) => id.trim());
            var checkForHexRegExp = /^[a-f\d]{24}$/i;
            ids.forEach(function(id) {
              if (checkForHexRegExp.test(id)) {
                bodyRequest._id['$in'].push(id);
              } else if (id !== '') {
                showModal('Warning', id + ' is not a valid ID');
              }
            });
          }
          $('.inputDescriptor').each(function() {
            if ($(this).val() !== '') {
              bodyRequest['$and'].push({
                'descriptors': {
                  '$elemMatch': {
                    'name': $(this).closest('.form-group').find('label').html(),
                    'value': $(this).val(),
                  },
                },
              });
            }
          });
          if (bodyRequest['$and'].length === 0) {
            delete bodyRequest['$and'];
          }
          if (bodyRequest._id['$in'].length === 0) {
            delete bodyRequest._id;
          }

          // redirect to the page
          if (bodyRequest['$and'] || bodyRequest.author || bodyRequest.category || bodyRequest.date) {
            window.location.href = '?page=' + $(this).html() + '&query=' + JSON.stringify(bodyRequest);
          } else {
            window.location.href = '?page=' + $(this).html();
          }
        });
      });
    });
  }

  // ---------------------------- Delete archive ------------------------------ //

  $('#archives-grid').on('click', '#deleteArchive', function() {
    var r = confirm('Please confirm that you want to delete this archive.');
    if (r === true) {
      $.ajax({
        method: 'DELETE',
        url: 'api/archives/id/' + $(this).parent().parent().parent().attr('id'),
        headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
        success: function() {
          location.reload();
        },
      });
    }
  });

  // ------------------------------ Edit archive ------------------------------ //

  $('#archives-grid').on('click', '#editArchive', function() {
    $.get('api/archives/id/' + $(this).parent().parent().parent().attr('id'), function(archive) {
      $('#modalEdit .modal-body').html('' +
      '<div class="form-group">' +
        '<label for="inputDateEdit">Date</label>' +
        '<input type="date" id="inputDateEdit" max="2100-12-31" min="2010-01-01" class="form-control" value="' + archive.date.substr(0, 10) + '" required>' +
      '</div>');
      if (archive.comments) {
        $('#modalEdit .modal-body').append('' +
        '<div class="form-group">' +
          '<label for="inputCommentsEdit">Comments (optional)</label>' +
          '<textarea id="inputCommentsEdit" class="form-control">' + archive.comments + '</textarea>' +
        '</div>');
      } else {
        $('#modalEdit .modal-body').append('' +
        '<div class="form-group">' +
          '<label for="inputCommentsEdit">Comments (optional)</label>' +
          '<textarea id="inputCommentsEdit" class="form-control"></textarea>' +
        '</div>');
      }
      $('#modalEdit .modal-body').append('' +
      '<div class="form-group" id="updateArchive" style="display: none;">' +
        '<label for="inputFiles">Files</label>' +
        '<div id="dropzone" class="dropzone"></div>' +
        '<input id="isFileUploaded" type="text" style="display: none;" value="false">' +
      '</div>' +
      '<button type="button" class="btn btn-outline-info" id="buttonUpdateArchive">Click here to update the archive content (zip)</button>');

      archive.descriptors.forEach(function(descriptor) {
        $('#modalEdit .modal-body').append('' +
        '<div class="form-group">' +
          '<label>' + descriptor.name + '</label>' +
          '<select class="form-control selectDescriptorEdit ' + descriptor.name + '">' +
            '<option>' + descriptor.value + '</option>' +
          '</select>' +
        '</div>'
        );
        $.get('api/categories/options/' + archive.category + '/' + descriptor.name, function(options) {
          if (options.length > 0) {
            options.forEach(function(option, idx, array) {
              if (option !== $('.selectDescriptorEdit.' + descriptor.name).val()) {
                $('.selectDescriptorEdit.' + descriptor.name).append('<option>' + option + '</option>');
              }
              if (idx === array.length-1) {
                $('.selectDescriptorEdit.' + descriptor.name).append('<option>Other</option>');
              }
            });
          } else {
            $('.selectDescriptorEdit.' + descriptor.name).append('<option>Other</option>');
          }
        });
      });
      $('#modalEdit .modal-footer').html('' +
        '<input type="submit" value="Apply" class="btn btn-info" id="submit-edit">' +
        '<button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>'
      );
      $('.form-edit').attr('id', archive._id);
    });
  });

  // add an input if the user select "Other" on a descriptor
  $('#modalEdit').on('change', '.selectDescriptorEdit', function() {
    if ($(this).val() === 'Other') {
      $(this).closest('.form-group').append('<input type="text" class="form-control inputDescriptorEdit" required>');
    } else {
      $(this).closest('.form-group').find('.inputDescriptorEdit').remove();
    }
  });

  $('.form-edit').submit(function(e) {
    e.preventDefault();
    var r = confirm('Please confirm that you want to modify this archive.');
    if (r === true) {
      var okayToPush = true;
      var archive = {
        date: $('#inputDateEdit').val(),
        descriptors: [],
        newZip: $('#isFileUploaded').val(),
      };
      if ($('#inputCommentsEdit').val().trim() !== '') {
        archive.comments = $('#inputCommentsEdit').val().trim();
      }
      $('.selectDescriptorEdit').each(function() {
        if ($(this).val() !== 'Other') {
          archive.descriptors.push({
            name: $(this).prev().html(),
            value: $(this).val().trim(),
          });
        }
      });
      $('.inputDescriptorEdit').each(function() {
        if ($(this).val().trim() === '') {
          okayToPush = false;
        } else {
          archive.descriptors.push({
            name: $(this).prev().prev().html(),
            value: $(this).val().trim().toLowerCase().replace(/\s+/g, ' '),
          });
        }
      });

      if (okayToPush === true) {
        $.ajax({
          method: 'POST',
          url: 'api/archives/id/' + $('.form-edit').attr('id'),
          headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
          data: archive,
          beforeSend: function() {
            if ($('#isFileUploaded').val() === 'false') {
              $('#myModal').modal({
                  backdrop: 'static',
                  keyboard: false,
              });
              showModal('Success', 'You will be redirected...<div class="loader"></div>');
              setTimeout(function() {
                location.reload();
              }, 3000);
            }
          },
          // success: function() {
          //
          // },
        });
      } else {
        showModal('Error', 'Your archive was not added because you left an empty field.');
      }
    }
  });

  // Update archive
  $('#modalEdit').on('click', '#buttonUpdateArchive', function() {
    $('#updateArchive').show();
    $(this).hide();
  });

  // --------------------------- Save research ---------------------------- //

  $('#buttonSaveSearch').click(function() {
    var search = {
      user: getUserName(),
      ids: [],
      descriptors: [],
    };
    if ($('#inputDate').val() !== '') {
      if ($('#checkboxDateRange').is(':checked') && $('#inputDate2').val() !== '') {
        // date range
        search.date = [
          $('#inputDate').val(),
          $('#inputDate2').val(),
        ];
      } else {
        // unique date
        search.date = $('#inputDate').val();
      }
    }
    if ($('#inputIds').val().trim() !== '') {
      var ids = $('#inputIds').val().split(',').map((id) => id.trim());
      var checkForHexRegExp = /^[a-f\d]{24}$/i;
      ids.forEach(function(id) {
        if (checkForHexRegExp.test(id)) {
          search.ids.push(id);
        }
      });
    }
    if ($('#selectCategory').val() !== 'default') {
      search.archiveCategory = $('#selectCategory').val();
    }
    if ($('#selectAuthor').val() !== 'default') {
      search.archiveAuthor = $('#selectAuthor').val();
    }

    $('.descriptor-group').each(function() {
      if ($(this).find('.inputDescriptor').val() !== '') {
        search.descriptors.push({
          name: $(this).find('.labelDescriptor').html(),
          value: $(this).find('.inputDescriptor').val(),
        });
      }
    });

    if (isConnected()) {
      if (search.descriptors.length > 0 || search.ids.length > 0 || search.date || search.archiveAuthor || search.archiveCategory) {
        // check if search already exist
        $.get('api/search', function(savedSearches) {
          return new Promise(function(resolve) {
            if (savedSearches.length === 0) {
              resolve(false);
            } else {
              savedSearches.forEach(function(savedSearch, idx) {
                idsAreTheSame(savedSearch.ids, search.ids)
                .then(function(idsAreTheSame) {
                  if (
                    (savedSearch.user === search.user) && (savedSearch.archiveCategory === search.archiveCategory)
                    && (savedSearch.archiveAuthor === search.archiveAuthor) && (JSON.stringify(savedSearch.date) === JSON.stringify(search.date))
                    && descriptorsAreTheSame(savedSearch.descriptors, search.descriptors) && idsAreTheSame
                  ) {
                    resolve(true);
                  } else if (idx === savedSearches.length - 1) {
                    resolve(false);
                  }
                });
              });
            }
          }).then(function(alreadyExist) {
            if (alreadyExist === false) {
              $.ajax({
                method: 'POST',
                url: 'api/search',
                headers: {'Authorization': 'Basic ' + btoa(getAuthentification())},
                data: search,
                success: function(data) {
                  console.log(data);
                  if (data.name === 'Success') {
                    showModal('Success', 'Your search has been saved !<br><br>You can now find it in "My Searches" to reuse it or to share it.');
                  }
                },
              });
            } else {
              showModal('Error', 'You already saved this search !<br><br>Check the page "My Searches" to manage them.');
            }
          });
        });
      } else {
        showModal('Error', 'Add some filters to your search before saving it.');
      }
    } else {
      showModal('Error', 'Please log in to save your search !');
    }
  });


  // ---------------------------- Page Loading ----------------------------- //

  // use the saved search if present in URL
  if (getUrlParameter('search')) {
    $.get('api/search/id/' + getUrlParameter('search'), function(search) {
      if (search._id) {
        return new Promise(function(resolve) {
          if (search.date) {
            if (typeof search.date === 'string') {
              // unique date
              $('#inputDate').val(search.date);
            } else {
              // date range
              $('#checkboxDateRange').trigger('click');
              $('#inputDate2').prop('disabled', false);
              $('#inputDate').val(search.date[0]);
              $('#inputDate2').val(search.date[1]);
            }
          }
          if (search.archiveCategory) {
            $('#selectCategory').val(search.archiveCategory);
            $('#selectCategory').trigger('change');
          }
          if (search.archiveAuthor) {
            $('#selectAuthor').val(search.archiveAuthor);
          }
          if (search.descriptors.length > 0) {
            search.descriptors.forEach(function(descriptor) {
              selectedDescriptor.push(descriptor.name);
              $('#form-search').append('' +
              '<div class="form-group descriptor-group">' +
                '<label class="labelDescriptor">' + descriptor.name + '</label>' +
                '<div class="row">' +
                  '<div class="col">' +
                    '<select class="form-control inputDescriptor ' + descriptor.name + '">' +
                      '<option></option>' +
                    '</select>' +
                  '</div>' +
                  '<div class="col-2">' +
                    '<button type="button" class="btn btn-warning deleteDescriptor" id="deleteDescriptor"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                  '</div>' +
                '</div>' +
              '</div>'
              );
              $.get('/api/archives/options/' + descriptor.name, function(options) {
                options.forEach(function(option) {
                  $('.inputDescriptor.' + descriptor.name).append('<option>' + option + '</option>');
                });
                $('.inputDescriptor.' + descriptor.name).val(descriptor.value);
              });
            });
          }
          if (search.ids.length > 0) {
            $('#inputIds').val(search.ids.join(', '));
          }
          setTimeout(function() {
            resolve();
          }, 100);
        }).then(function() {
          $('#form-search').trigger('change');
        });
      } else {
        console.log('Error with the search ID in params.');
        console.log(search);
      }
    });
  } else if (getUrlParameter('page') && getUrlParameter('query')) {
    var page = getUrlParameter('page');
    var query = JSON.parse(getUrlParameter('query'));

    // put the query in the search-box
    setTimeout(function() {
      if (query.author) {
        $('#selectAuthor').val(query.author);
      }
      if (query.date) {
        if (typeof query.date === 'string') {
          // unique date
          $('#inputDate').val(query.date);
        } else {
          // date range
          $('#checkboxDateRange').trigger('click');
          $('#inputDate2').prop('disabled', false);
          $('#inputDate').val(query.date[0]);
          $('#inputDate2').val(query.date[1]);
        }
      }
      if (query.category) {
        $('#selectCategory').val(query.category);
        $('#selectCategory').trigger('change');
      }
      if (query['$and']) {
        query['$and'].forEach(function(specificFilter) {
          selectedDescriptor.push(specificFilter.descriptors['$elemMatch'].name);
          $('#form-search').append('' +
          '<div class="form-group descriptor-group">' +
            '<label class="labelDescriptor">' + specificFilter.descriptors['$elemMatch'].name + '</label>' +
            '<div class="row">' +
              '<div class="col">' +
                '<select class="form-control inputDescriptor" id="inputDescriptor' + specificFilter.descriptors['$elemMatch'].name + '">' +
                  '<option></option>' +
                '</select>' +
              '</div>' +
              '<div class="col-2">' +
                '<button type="button" class="btn btn-warning deleteDescriptor" id="deleteDescriptor"><i class="fa fa-times" aria-hidden="true"></i></button>' +
              '</div>' +
            '</div>' +
          '</div>'
          );
          $.get('/api/archives/options/' + specificFilter.descriptors['$elemMatch'].name, function(options) {
            options.forEach(function(option) {
              $('#inputDescriptor' + specificFilter.descriptors['$elemMatch'].name).append('<option>' + option + '</option>');
            });
            $('#inputDescriptor' + specificFilter.descriptors['$elemMatch'].name).val(specificFilter.descriptors['$elemMatch'].value);
          });
        });
      }
      search(query, page);
    }, 100);
  } else if (getUrlParameter('page')) {
    var page = getUrlParameter('page');
    search({}, page);
  } else {
    search({}, 1);
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

  function descriptorsAreTheSame(firstDescriptorsArray, secondDescriptorsArray) {
    if (firstDescriptorsArray.length === secondDescriptorsArray.length) {
      if (firstDescriptorsArray.length === 0) {
        return true;
      } else {
        var dict1 = {};
        var dict2 = {};
        firstDescriptorsArray.forEach(function(descriptor) {
          dict1[descriptor.name] = descriptor.value;
        });
        secondDescriptorsArray.forEach(function(descriptor) {
          dict2[descriptor.name] = descriptor.value;
        });
        for (var key in dict1) {
          if (!dict2[key] || dict1[key] !== dict2[key]) {
            return false;
          }
        }
      }
    } else {
      return false;
    }
    return true;
  }

  function idsAreTheSame(firstIdsArray, secondIdsArray) {
    return new Promise(function(resolve) {
      if (firstIdsArray.length === secondIdsArray.length) {
        if (firstIdsArray.length === 0) {
          resolve(true);
        } else {
          firstIdsArray.forEach(function(id, index) {
            if (!secondIdsArray.includes(id)) {
              resolve(false);
            } else if (index === firstIdsArray.length - 1) {
              resolve(true);
            }
          });
        }
      } else {
        resolve(false);
      }
    });
  }

  function showModal(title, message) {
    $('#myModal .modal-header').html('<h4 class="modal-title">' + title + '</h4>');
    $('#myModal .modal-body').html('<p>' + message + '<p>');
    $('#myModal').modal('show');
  }
})(jQuery);
