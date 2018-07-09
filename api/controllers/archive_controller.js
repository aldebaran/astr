var fs = require('fs');
var AdmZip = require('adm-zip');
var User = require('../models/user_model');
var Test = require('../models/test_model');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of files in the archive with the associated ID
exports.getArchiveContent = (req, res) => {
  var id = req.params.id;
  var zip = new AdmZip('archives/' + id + '.zip');
  var zipEntries = zip.getEntries();
  var files = [];

  zipEntries.forEach(function(zipEntry, idx) {
    if (zipEntry.entryName !== 'info.txt') {
      files.push(zipEntry.entryName);
    }
  });
  res.json(files);
};

// POST: Update the content of the archive with the associated ID. It is possible to delete files and add new ones.
// (two arrays can be in the body request: "add" and "delete")
// **(user must be master or owner of the test)**
exports.updateContent = (req, res) => {
  // check if user has authorization
  User.hasAuthorization(req, ['master', 'owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var id = req.params.id;
      // check if test ID exist
      Test.findById(id, (err, test) => {
        if (test === null) {
          res.status(404).json({
            name: 'Error',
            message: 'This test id doesn\'t exist',
          });
        } else {
          var filesToDelete = req.body.delete;
          var filesToAdd = req.body.add;
          var zip = new AdmZip('archives/' + id + '.zip');
          var zipEntries = zip.getEntries();
          var files = [];

          if (filesToDelete && filesToAdd && filesToDelete.length > 0 && filesToAdd.length > 0) {
            filesToDelete.forEach(function(filenameDelete, idx) {
              // remove the file from the archive
              zip.deleteFile(filenameDelete);
              if (idx === filesToDelete.length - 1) {
                // add new files in the archive
                var errorOccured = false;
                filesToAdd.forEach(function(filenameAdd, index) {
                  var path = 'archives/' + filenameAdd;
                  fs.stat(path, (error, stats) => {
                    if (error) {
                      errorOccured = true;
                      console.log('File not found: ' + path.split('/')[1]);
                    } else {
                      zip.addLocalFile(path);
                      // delete raw files
                      fs.unlink(path, (err) => {});
                    }
                    if (index === filesToAdd.length - 1) {
                      if (errorOccured) {
                        res.status(500).json({
                          name: 'Error',
                          message: 'A path is incorrect',
                        });
                      } else {
                        // update "archiveContent" list in test object
                        zipEntries.forEach(function(zipEntry, idx) {
                          if (zipEntry.entryName !== 'info.txt') {
                            files.push(zipEntry.entryName);
                          }
                        });
                        Test.findByIdAndUpdate(id, {'$set': {'archiveContent': files}}, {new: true}, (err, test) => {
                          if (err) {
                            console.log(err);
                          }
                        });
                        // rewrite the zip
                        zip.writeZip('archives/' + id + '.zip');
                        res.json({
                          'delete': filesToDelete,
                          'add': filesToAdd,
                        });
                      }
                    }
                  });
                });
              }
            });
          } else if (filesToDelete && filesToDelete.length > 0) {
            filesToDelete.forEach(function(filename, idx) {
              // remove the file from the archive
              zip.deleteFile(filename);
              if (idx === filesToDelete.length - 1) {
                // update "archiveContent" list in test object
                zipEntries.forEach(function(zipEntry, idx) {
                  if (zipEntry.entryName !== 'info.txt') {
                    files.push(zipEntry.entryName);
                  }
                });
                Test.findByIdAndUpdate(id, {'$set': {'archiveContent': files}}, {new: true}, (err, test) => {
                  if (err) {
                    console.log(err);
                  }
                });
                // rewrite the zip
                zip.writeZip('archives/' + id + '.zip');
                res.json({
                  'delete': filesToDelete,
                  'add': [],
                });
              }
            });
          } else if (filesToAdd && filesToAdd.length > 0) {
            // add new files in the archive
            var errorOccured = false;
            filesToAdd.forEach(function(filename, idx) {
              var path = 'archives/' + filename;
              fs.stat(path, (error, stats) => {
                if (error) {
                  errorOccured = true;
                  console.log('File not found: ' + path.split('/')[1]);
                } else {
                  zip.addLocalFile(path);
                  // delete raw files
                  fs.unlink(path, (err) => {});
                }
                if (idx === filesToAdd.length - 1) {
                  if (errorOccured) {
                    res.status(500).json({
                      name: 'Error',
                      message: 'A path is incorrect',
                    });
                  } else {
                    // update "archiveContent" list in test object
                    zipEntries.forEach(function(zipEntry, idx) {
                      if (zipEntry.entryName !== 'info.txt') {
                        files.push(zipEntry.entryName);
                      }
                    });
                    Test.findByIdAndUpdate(id, {'$set': {'archiveContent': files}}, {new: true}, (err, test) => {
                      if (err) {
                        console.log(err);
                      }
                    });
                    // rewrite the zip
                    zip.writeZip('archives/' + id + '.zip');
                    res.json({
                      'delete': [],
                      'add': filesToAdd,
                    });
                  }
                }
              });
            });
          } else {
            res.json({
              'delete': [],
              'add': [],
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};
