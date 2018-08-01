var fs = require('fs-extra');
var request = require('request');
var StreamZip = require('node-stream-zip');
var archiver = require('archiver');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Archive = mongoose.model('Archive');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of all archives (sorted by creation date in descending order)
exports.getAllArchives = (req, res) => {
  checkIfZipPresent(req)
  .then(() => {
    Archive.find({})
    .where('isZipPresent').equals(true)
    .sort({'created': -1})
    .exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.json(data);
      }
    });
  });
};

// GET: Returns the list of all archives that are missing in the folder "archives" (to delete them)
exports.getAllMissingArchives = (req, res) => {
  checkIfZipPresent(req)
  .then(() => {
    Archive.find({})
    .where('isZipPresent').equals(false)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.json(data);
      }
    });
  });
};

// POST: Returns the list of archives that match with the parameters given in the body request (sorted by creation date in descending order)
exports.getArchivesByQuery = (req, res) => {
  checkIfZipPresent(req)
  .then(() => {
    if (req.body.date && typeof req.body.date !== 'string') {
      // search archives between two dates
      var from = new Date(req.body.date[0]);
      var to = new Date(req.body.date[1]);
      req.body.date = {
        '$gte': from,
        '$lte': to,
      };
      Archive.find(req.body)
      .where('isZipPresent').equals(true)
      .sort({'created': -1})
      .exec((err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      Archive.find(req.body)
      .where('isZipPresent').equals(true)
      .sort({'created': -1})
      .exec((err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    }
  });
};

// POST: Returns the list of archives that match with the parameters given in the body request, with pagination (sorted by creation date in descending order)
exports.getArchivesByQueryAndPage = (req, res) => {
  checkIfZipPresent(req)
  .then(() => {
    var page = Number(req.params.page);
    var resultPerPage = Number(req.params.resultPerPage);
    if (req.body.date && typeof req.body.date !== 'string') {
      // search archives between two dates
      var from = new Date(req.body.date[0]);
      var to = new Date(req.body.date[1]);
      req.body.date = {
        '$gte': from,
        '$lte': to,
      };
      Archive.find(req.body)
      .where('isZipPresent').equals(true)
      .sort({'created': -1})
      .limit(resultPerPage)
      .skip((page-1)*resultPerPage)
      .exec((err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.send(data);
        }
      });
    } else {
      Archive.find(req.body)
      .where('isZipPresent').equals(true)
      .sort({'created': -1})
      .limit(resultPerPage)
      .skip((page-1)*resultPerPage)
      .exec((err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.send(data);
        }
      });
    }
  });
};

// POST: Add a new archive in the DB in function of the parameters given in the body request
exports.addArchive = (req, res) => {
  User.hasAuthorization(req, ['write_permission'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var newArchive = new Archive(req.body);
      newArchive.created = Date.now();
      newArchive.lastModification = Date.now();
      newArchive.date = new Date(newArchive.date);
      // check if the archive category exists and if all descriptors are given
      request.get({
        url: 'http://localhost:' + req.connection.localPort + '/api/categories/name/' + newArchive.category,
        json: true,
      }, (err1, res1, archiveCategory) => {
        if (err1) {
          res.send(err1);
        } else if (archiveCategory.name === 'Failed') {
          res.send(archiveCategory);
        } else {
          allDescriptorsAreInArchive(newArchive, archiveCategory)
          .then((allDescriptorsAreInArchive) => {
            if (allDescriptorsAreInArchive) {
              newArchive.archiveCategoryId = archiveCategory._id;
              // delete descriptors that are not in the archive category
              var descriptorsNames = [];
              archiveCategory.descriptors.forEach(function(descriptor, idx) {
                descriptorsNames.push(descriptor.name);
                if (idx === archiveCategory.descriptors.length - 1) {
                  newArchive.descriptors = newArchive.descriptors.filter(
                    (desc) => descriptorsNames.includes(desc.name)
                  );
                }
              });

              // sort descriptors by name
              newArchive.descriptors.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );

              // save the archive in the database
              newArchive.save((err, data) => {
                if (err) {
                  res.send(err);
                } else {
                  res.json({
                    name: 'Success',
                    message: 'Archive successfully added',
                    archive: data,
                  });
                }
              });
            } else {
              missingDescriptors(newArchive, archiveCategory)
              .then((missingDescriptors) => {
                res.send({
                  name: 'Failed',
                  message: 'The archive must include all descriptors of the archive category',
                  missing_descriptors: missingDescriptors,
                });
              });
            }
          });
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// GET: Returns the archive with the associated ID
exports.getArchive = (req, res) => {
  var id = req.params.id;
  Archive.findById(id, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data === null) {
        res.status(404).json({
          name: 'Failed',
          message: 'This archive id doesn\'t exist',
        });
      } else {
        res.json(data);
      }
    }
  });
};

// GET: Returns the archive with the associated ID in a YAML format, to store it in the zip
exports.getArchiveInYAMLFormat = (req, res) => {
  var id = req.params.id;
  Archive.findById(id, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data === null) {
        res.status(404).json({
          name: 'Failed',
          message: 'This archive id doesn\'t exist',
        });
      } else {
        var txt = ('---\n' +
                 'id: ' + data._id + '\n' +
                 'date: ' + data.date.toISOString().substr(0, 10) + '\n' +
                 'author: ' + data.author + '\n' +
                 'archive_category: ' + data.category + '\n'
        );
        if (data.comments) {
          txt += 'comments: ' + data.comments + '\n';
        }
        txt += 'descriptors:\n';
        data.descriptors.forEach(function(descriptor) {
          txt += '  ' + descriptor.name + ': ' + descriptor.value + '\n';
        });
        res.send(txt);
      }
    }
  });
};

// POST: Update the archive with the associated ID in function of the parameters given in the body request (only the date, the comments, and the descriptors values can be updated)
// "newZip" in body request is "true" if the zip is being replaced with "api/upload/replace-zip"
exports.updateArchive = (req, res) => {
  User.hasAuthorization(req, ['master', 'owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var id = req.params.id;
      var body = req.body;
      body.newZip = (body.newZip === 'true');

      Archive.findById(id, (err, archive) => {
        if (err) {
          res.send(err);
        } else {
          if (archive === null) {
            res.status(404).json({
              name: 'Failed',
              message: 'This archive id doesn\'t exist',
            });
          } else {
            archive.lastModification = Date.now();
            archive.isDownloadable = false;
            if (body.date) {
              archive.date = new Date(body.date);
            }
            if (body.comments) {
              archive.comments = body.comments;
            }
            if (body.descriptors && body.descriptors.length > 0) {
              body.descriptors.forEach(function(newDescriptor) {
                archive.descriptors.forEach(function(currentDescriptor) {
                  if (newDescriptor.name === currentDescriptor.name) {
                    currentDescriptor.value = newDescriptor.value;
                  }
                });
              });
            }
            Archive.findByIdAndUpdate(id, archive, {new: true}, (err2, data) => {
              if (err2) {
                res.send(err2);
              } else if (req.body.newZip === false) {
                // update txt file inside the archive (info)
                request.get({
                  url: 'http://localhost:' + req.connection.localPort + '/api/archives/YAMLformat/id/' + archive._id,
                }, (err, response, archiveInfo) => {
                  if (err) {
                    console.log(err);
                  } else {
                    // create temporary folder to store info.txt and files from the archive
                    var folderName = id + '_temp';
                    var path = 'archives/' + folderName;
                    fs.mkdir(path, (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        // unzip the content of the archive
                        const zip = new StreamZip({
                            file: 'archives/' + id + '.zip',
                            storeEntries: true,
                        });
                        zip.on('error', (err) => {
                          console.log(err);
                        });
                        zip.on('ready', () => {
                          console.log('extracting ' + path);
                          zip.extract(null, './' + path, (err, count) => {
                            console.log('extracted');
                            zip.close();

                            // create new info.txt
                            fs.writeFile(path + '/info.txt', archiveInfo, (err) => {
                              if (err) {
                                console.log(err);
                              }
                            });

                            // zip the files with info.txt
                            console.log('zipping ' + path);
                            var output = fs.createWriteStream('archives/' + id + '.zip');
                            var archive = archiver('zip', {
                              zlib: {level: 0},
                            });
                            output.on('close', function() {
                              console.log('zipped');
                              fs.removeSync(path);
                              // update archive: isDownloadable = true
                              Archive.findByIdAndUpdate(id, {'$set': {'isDownloadable': true}}, (err) => {
                                if (err) {
                                  console.log(err);
                                }
                              });
                            });
                            archive.on('warning', function(err) {
                              console.log(err);
                            });
                            archive.on('error', function(err) {
                              console.log(err);
                            });
                            archive.pipe(output);
                            archive.directory(path, false);
                            archive.finalize()
                            .then(() => {
                              res.json({
                                name: 'Success',
                                message: 'Archive successfully modified',
                                archive: data,
                              });
                            });
                          });
                        });
                      }
                    });
                  }
                });
              } else {
                res.json({
                  name: 'Success',
                  message: 'Archive successfully modified',
                  archive: data,
                });
              }
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// DELETE: Delete the archive with the associated ID
exports.deleteArchive = (req, res) => {
  User.hasAuthorization(req, ['master', 'owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var id = req.params.id;
      // delete the zip
      fs.unlink('archives/' + id + '.zip', (err) => {
        if (err) console.log(err);
        else console.log('successfully deleted ' + id + '.zip');
      });
      Archive.findByIdAndRemove(id, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          if (data === null) {
            res.status(404).json({
              name: 'Failed',
              message: 'This archive id doesn\'t exist',
            });
          } else {
            res.json({
              name: 'Success',
              message: 'Archive successfully deleted',
              archive: data,
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// GET: Returns the list of archive authors (that added at least one archive)
exports.getDistinctAuthors = (req, res) => {
  Archive.distinct('author', {}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
};

// GET: Returns the list of archive categories (used at least by one archive)
exports.getDistinctCategories = (req, res) => {
  Archive.distinct('category', {}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
};

// GET: Returns the list of descriptors (used at least by one archive)
exports.getDistinctDescriptors = (req, res) => {
  Archive.distinct('descriptors.name', {}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
};

// GET: Returns the list of descriptors of the associated archive category (used at least by one archive)
exports.getDescriptorsOfArchiveCategory = (req, res) => {
  var category = req.params.category;
  Archive.distinct('descriptors.name', {category: category}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
};

// GET: Returns the  options of the associated descriptor (used at least one time)
exports.getOptionsOfDescriptor = (req, res) => {
  var descriptorName = req.params.descriptorName;
  Archive.aggregate([
    {'$unwind': '$descriptors'},
    {'$match': {'descriptors.name': descriptorName}},
    {'$group': {'_id': null, 'values': {'$addToSet': '$descriptors.value'}}},
    {'$project': {'values': true, '_id': false}},
  ])
  .exec((err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data.length === 1) {
        res.json(data[0].values.sort());
      } else {
        res.status(404).json({'error': 'Nothing found'});
      }
    }
  });
};

// POST: Change the category name of all the archives matched by {category: previousName} (body contains previousName and newName)
exports.changeArchiveCategoryName = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var previousName = req.body.previousName;
      var newName = req.body.newName;
      Archive.update({'category': previousName}, {'category': newName}, {multi: true}, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// POST: Push a new descriptor in all archives matched by the archive category (body contains category and descriptor: {name, value})
exports.addDescriptor = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var descriptor = req.body.descriptor;
      var category = req.body.category;
      Archive.update({'category': category}, {'$push': {'descriptors': descriptor}}, {multi: true}, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// POST: Change the name of the matched descriptors in all archives matched by the archive category (body contains category, previousName and newName)
exports.changeDescriptorName = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var previousName = req.body.previousName;
      var newName = req.body.newName;
      var category = req.body.category;
      Archive.update({'category': category, 'descriptors.name': previousName}, {'$set': {'descriptors.$.name': newName}}, {multi: true}, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.json(data);
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

/**
 * Verify that all the archives have a zip.
 * If not, the archive is updated with "isZipPresent": false.
 * If "isZipPresent" is false and the archive was not created today, then the archive
 * is deleted.
 * @return {Promise}
 * @param {Object} req
 */
function checkIfZipPresent(req) {
  return new Promise((resolve, reject) => {
    Archive.find({}, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        request.get({
          url: 'http://localhost:' + req.connection.localPort + '/api/download/files',
          json: true,
        }, (err2, res, files) => {
          if (err2) {
            console.log('Error:', err2);
            reject(err2);
          } else {
            data.forEach(function(archive, idx, array) {
              if ('isZipPresent' in archive) {
                if (archive.isZipPresent !== files.includes(archive._id.toString())) {
                  Archive.findByIdAndUpdate(archive._id, {isZipPresent: files.includes(archive._id.toString())}, (err3, data) => {
                    if (err3) {
                      console.log(err3);
                      reject(err3);
                    }
                  });
                }
                if (archive.isZipPresent === false) {
                  // delete the archive if not created today
                  var today = new Date().setHours(0, 0, 0, 0);
                  if (today !== archive.created.setHours(0, 0, 0, 0)) {
                    Archive.findByIdAndRemove(archive._id, (err3, data) => {
                      if (err3) {
                        console.log(err3);
                        reject(err3);
                      }
                    });
                  }
                }
              } else {
                Archive.findByIdAndUpdate(archive._id, {isZipPresent: files.includes(archive._id.toString())}, (err3, data) => {
                  if (err3) {
                    console.log(err3);
                    reject(err3);
                  }
                });
              }
            });
            resolve();
          }
        });
      }
    });
  });
}

/**
 * Verify that all the descriptors of an archive category are in the new archive
 * @param {object} newArchive
 * @param {object} archiveCategory
 * @return {Promise.<Boolean>}
 */
function allDescriptorsAreInArchive(newArchive, archiveCategory) {
  return new Promise((resolve) => {
    var archiveDescriptorsNames = [];
    newArchive.descriptors.forEach(function(archiveDescriptor, idx) {
      archiveDescriptorsNames.push(archiveDescriptor.name);
      if (idx === newArchive.descriptors.length - 1) {
        archiveCategory.descriptors.forEach(function(descriptor, index) {
          if (!archiveDescriptorsNames.includes(descriptor.name)) {
            resolve(false);
          } else if (index === archiveCategory.descriptors.length - 1) {
            resolve(true);
          }
        });
      }
    });
  });
}

/**
 * Get all the missing descriptors of an archive
 * @param {object} newArchive
 * @param {object} archiveCategory
 * @return {Promise.<Array.<String>>}
 */
function missingDescriptors(newArchive, archiveCategory) {
  return new Promise((resolve) => {
    var res = [];
    var archiveDescriptorsNames = [];
    newArchive.descriptors.forEach(function(archiveDescriptor, idx) {
      archiveDescriptorsNames.push(archiveDescriptor.name);
      if (idx === newArchive.descriptors.length - 1) {
        archiveCategory.descriptors.forEach(function(descriptor, index) {
          if (!archiveDescriptorsNames.includes(descriptor.name)) {
            res.push(descriptor.name);
          }
          if (index === archiveCategory.descriptors.length - 1) {
            resolve(res);
          }
        });
      }
    });
  });
}
