const fs = require('fs');
var request = require('request');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Test = mongoose.model('Test');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of all tests
exports.getAllTests = (req, res) => {
  checkIfTestsHaveAnArchive()
  .then(() => {
    Test.find({})
    .where('archive').equals(true)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  });
};

// GET: Returns the list of all tests without any archive (to delete them)
exports.getAllTestsWithoutArchive = (req, res) => {
  checkIfTestsHaveAnArchive()
  .then(() => {
    Test.find({})
    .where('archive').equals(false)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  });
};

// POST: Returns the list of tests that match with the parameters given in the body request
exports.getTestsByQuery = (req, res) => {
  checkIfTestsHaveAnArchive()
  .then(() => {
    Test.find(req.body)
    .where('archive').equals(true)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  });
};

// POST: Returns the list of tests that match with the parameters given in the body request, with pagination
exports.getTestsByQueryAndPage = (req, res) => {
  checkIfTestsHaveAnArchive()
  .then(() => {
    var page = Number(req.params.page);
    var resultPerPage = Number(req.params.resultPerPage);
    Test.find(req.body)
    .where('archive').equals(true)
    .limit(resultPerPage)
    .skip((page-1)*resultPerPage)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.send(data);
      }
    });
  });
};

// POST: Add a new test in the DB in function of the parameters given in the body request
exports.addTest = (req, res) => {
  User.hasAuthorization(req, ['write_permission'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var newTest = new Test(req.body);
      newTest.created = Date.now();
      newTest.lastModification = Date.now();
      // check if the test subject exists and if all configuration are given
      request.get({
        url: 'http://localhost:8000/api/test-subjects/name/' + newTest.type,
        json: true
      }, (err1, res1, testSubject) => {
        if (err1) {
          res.send(err1);
        } else if (testSubject.name === 'Failed') {
          res.send(testSubject);
        } else {
          allSubjectConfigurationsAreInTest(newTest, testSubject)
          .then((allSubjectConfigurationsAreInTest) => {
            if (allSubjectConfigurationsAreInTest) {
              newTest.testSubjectId = testSubject._id;
              // delete configs that are not in the test subject
              var subjectConfigNames = [];
              testSubject.configuration.forEach(function(subjectConfig, idx) {
                subjectConfigNames.push(subjectConfig.name);
                if (idx === testSubject.configuration.length - 1) {
                  newTest.configuration = newTest.configuration.filter(config => subjectConfigNames.includes(config.name))
                }
              });

              // save the test in the database
              newTest.save((err, data) => {
                if (err) {
                  res.send(err);
                }
                else {
                  res.json({name: 'Success', message: 'Test successfully added', test: data});
                }
              });
            } else {
              missingConfigs(newTest, testSubject)
              .then((missingConfigs) => {
                res.send({
                  name: 'Failed',
                  message: 'The test must include all configurations of the test subject',
                  missing_configurations: missingConfigs
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
}

// GET: Returns the test with the associated ID
exports.getTest = (req, res) => {
  var id = req.params.id;
  Test.findById(id, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.status(404).json({name: 'Failed', message: 'This test id doesn\'t exist'});
      }
      else {
        res.json(data);
      }
    }
  });
}

// POST: Update the test with the associated ID in function of the parameters given in the body request (only the date and the configuration values can be updated)
exports.updateTest = (req, res) => {
  User.hasAuthorization(req, ['master', 'owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var id = req.params.id;
      var body = req.body;

      Test.findById(id, (err, test) => {
        if (err) {
          res.send(err);
        } else {
          if (test === null) {
            res.status(404).json({name: 'Failed', message: 'This test id doesn\'t exist'});
          } else {
            test.lastModification = Date.now();
            if (body.date) {
              test.date = body.date;
            }
            if (body.configuration && body.configuration.length > 0) {
              body.configuration.forEach(function(newConfig) {
                test.configuration.forEach(function(currentConfig) {
                  if (newConfig.name === currentConfig.name) {
                    currentConfig.value = newConfig.value;
                  }
                });
              });
            }
            Test.findByIdAndUpdate(id, test, {new: true}, (err2, data) => {
              if (err2) {
                res.send(err2);
              }
              else {
                res.json({name: 'Success', message: 'Test successfully modified', test: data});
              }
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}

// DELETE: Delete the test with the associated ID
exports.deleteTest = (req, res) => {
  User.hasAuthorization(req, ['master', 'owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var id = req.params.id;
      // delete the archive (file)
      fs.unlink('archives/' + id + '.zip', (err) => {
        if (err) console.log(err);
        else console.log('successfully deleted ' + id + '.zip');
      });
      Test.findByIdAndRemove(id, (err, data) => {
        if (err) {
          res.send(err);
        }
        else {
          if(data === null){
            res.status(404).json({name: 'Failed', message: 'This test id doesn\'t exist'});
          }
          else {
            res.json({name: 'Success', message: 'Test successfully deleted', test: data});
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}

// GET: Returns the list of test authors (that wrote at least one test)
exports.getDistinctAuthors = (req, res) => {
  Test.distinct('author', {}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the list of test subjects (used at least by one test)
exports.getDistinctSubjects = (req, res) => {
  Test.distinct('type', {}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the list of configurations (used at least by one test)
exports.getDistinctConfigurations = (req, res) => {
  Test.distinct('configuration.name', {}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the list of configurations of the associated subject (used at least by one test)
exports.getConfigurationsOfSubject = (req, res) => {
  var subject = req.params.subject;
  Test.distinct('configuration.name', {type: subject}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the  options of the associated configuration (used at least one time)
exports.getOptionsOfConfig = (req, res) => {
  var configName = req.params.configname;
  Test.aggregate([
    {"$unwind": "$configuration"},
    {"$match": {"configuration.name": configName}},
    {"$group": {"_id": null, "values": {"$addToSet": "$configuration.value"}}},
    {"$project": {"values": true, "_id": false}}
  ])
  .exec((err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data.length === 1) {
        res.json(data[0].values);
      } else {
        res.status(404).json({'error': 'Nothing found'});
      }
    }
  });
};

// POST: Change the test type of all the tests matched by {type: previousName} (body contains previousName and newName)
exports.changeTestSubjectName = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var previousName = req.body.previousName;
      var newName = req.body.newName;
      Test.update({type: previousName}, {type: newName}, {multi: true}, (err, data) => {
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
}

// POST: Push a new configuration in all tests matched by the test type/subject (body contains subject and config: {name, value})
exports.addConfig = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var config = req.body.config;
      var subject = req.body.subject;
      Test.update({type: subject}, {$push: {configuration: config}}, {multi: true}, (err, data) => {
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
}

// POST: Change the name of the matched configuration in all tests matched by the test type/subject (body contains subject, previousName and newName)
exports.changeConfigName = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var previousName = req.body.previousName;
      var newName = req.body.newName;
      var subject = req.body.subject;
      Test.update({type: subject, 'configuration.name': previousName}, {$set: {'configuration.$.name': newName}}, {multi: true}, (err, data) => {
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
}

function checkIfTestsHaveAnArchive() {
  return new Promise((resolve, reject) => {
    Test.find({}, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        request.get({
          url: 'http://localhost:8000/api/download/files',
          json: true,
        }, (err2, res, archives) => {
          if (err2) {
            console.log('Error:', err2);
            reject(err2);
          } else {
            data.forEach(function(test, idx, array) {
              if ('archive' in test) {
                if (test.archive !== archives.includes(test._id.toString())) {
                  Test.findByIdAndUpdate(test._id, {archive: archives.includes(test._id.toString())}, (err3, data) => {
                    if (err3) {
                      console.log(err3);
                      reject(err3);
                    }
                  });
                }
                if (test.archive === false) {
                  // delete the test if not created today
                  var today = new Date().setHours(0,0,0,0);
                  if (today !== test.created.setHours(0,0,0,0)) {
                    Test.findByIdAndRemove(test._id, (err3, data) => {
                      if (err3) {
                        console.log(err3);
                        reject(err3);
                      }
                    });
                  }
                }
              } else {
                Test.findByIdAndUpdate(test._id, {archive: archives.includes(test._id.toString())}, (err3, data) => {
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

function allSubjectConfigurationsAreInTest(newTest, testSubject) {
  return new Promise((resolve) => {
    var testConfigNames = [];
    newTest.configuration.forEach(function(testConfig, idx) {
      testConfigNames.push(testConfig.name);
      if (idx === newTest.configuration.length - 1) {
        testSubject.configuration.forEach(function(subjectConfig, index) {
          if (!testConfigNames.includes(subjectConfig.name)) {
            resolve(false);
          } else if (index === testSubject.configuration.length - 1) {
            resolve(true);
          }
        });
      }
    });
  });
}

function missingConfigs(newTest, testSubject) {
  return new Promise((resolve) => {
    var res = [];
    var testConfigNames = [];
    newTest.configuration.forEach(function(testConfig, idx) {
      testConfigNames.push(testConfig.name);
      if (idx === newTest.configuration.length - 1) {
        testSubject.configuration.forEach(function(subjectConfig, index) {
          if (!testConfigNames.includes(subjectConfig.name)) {
            res.push(subjectConfig.name)
          }
          if (index === testSubject.configuration.length - 1) {
            resolve(res);
          }
        });
      }
    });
  });
}
