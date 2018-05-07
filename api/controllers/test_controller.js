var mongoose = require('mongoose'),
  Test = mongoose.model('Test');

exports.getAllTests = (req, res) => {
  Test.find({}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.getTestsByQuery = (req, res) => {
  Test.find(req.body, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.addTest = (req, res) => {
  var newTest = new Test(req.body);
  newTest.created = Date.now();
  newTest.lastModification = Date.now();
  newTest.save((err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json({name: 'Success', message: 'Test successfully added', test: data});
    }
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
