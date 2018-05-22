const fs = require('fs');
var request = require('request');
var mongoose = require('mongoose'),
  Test = mongoose.model('Test');

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

exports.addTest = (req, res) => {
  var newTest = new Test(req.body);
  newTest.created = Date.now();
  newTest.lastModification = Date.now();
  request.get({
    url: 'http://localhost:8000/api/test-subjects/name/' + newTest.type,
    json: true
  }, (err1, res1, testSubject) => {
    newTest.testSubjectId = testSubject._id;
    newTest.save((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json({name: 'Success', message: 'Test successfully added', test: data});
      }
    });
  });
}

exports.getTest = (id, res) => {
  Test.findById(id, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.json({name: 'Failed', message: 'This id doesn\'t exist'});
      }
      else {
        res.json(data);
      }
    }
  });
}

exports.updateTest = (id, body, res) => {
  body.lastModification = Date.now();
  Test.findByIdAndUpdate(id, body, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.json({name: 'Failed', message: 'This id doesn\'t exist'});
      }
      else {
        res.json({name: 'Success', message: 'Test successfully modified', modified: body, before: data});
      }
    }
  });
}

exports.deleteTest = (id, res) => {
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
        res.json({name: 'Failed', message: 'This id doesn\'t exist'});
      }
      else {
        res.json({name: 'Success', message: 'Test successfully deleted', test: data});
      }
    }
  });
}

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

exports.getConfigurationsOfSubject = (subject, res) => {
  Test.distinct('configuration.name', {type: subject}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.getOptionsOfConfig = (configName, res) => {
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
        res.json({'error': 'Nothing found'});
      }
    }
  });
};

exports.changeTestSubjectName = (req, res) => {
  var previousName = req.body.previousName;
  var newName = req.body.newName;
  Test.update({type: previousName}, {type: newName}, {multi: true}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
}

exports.addConfig = (req, res) => {
  var config = req.body.config;
  var subject = req.body.subject;
  Test.update({type: subject}, {$push: {configuration: config}}, {multi: true}, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.json(data);
    }
  });
}

exports.changeConfigName = (req, res) => {
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
        }, (err, res2, archives) => {
          if (err) {
            console.log('Error:', err);
            reject(err);
          } else {
            data.forEach(function(test, idx, array) {
              if ('archive' in test) {
                if (test.archive !== archives.includes(test._id.toString())) {
                  Test.findByIdAndUpdate(test._id, {archive: archives.includes(test._id.toString())}, (err, data) => {
                    if (err) {
                      console.log(err);
                      reject(err);
                    }
                  });
                }
              } else {
                Test.findByIdAndUpdate(test._id, {archive: archives.includes(test._id.toString())}, (err, data) => {
                  if (err) {
                    console.log(err);
                    reject(err);
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
