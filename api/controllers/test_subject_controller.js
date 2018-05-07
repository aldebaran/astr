var mongoose = require('mongoose'),
  TestSubject = mongoose.model('TestSubject');

exports.getAllTestSubjects = (req, res) => {
  TestSubject.find({}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.addTestSubject = (req, res) => {
  var newTestSubject = new TestSubject(req.body);
  newTestSubject.created = Date.now();
  newTestSubject.save((err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json({name: 'Success', message: 'Test subject successfully added', test: data});
    }
  });
}

exports.getTestSubject = (id, res) => {
  TestSubject.findById(id, (err, data) => {
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

exports.updateTestSubject = (id, body, res) => {
  TestSubject.findByIdAndUpdate(id, body, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.json({name: 'Failed', message: 'This id doesn\'t exist'});
      }
      else {
        res.json({name: 'Success', message: 'Test subject successfully modified', modified: body, before: data});
      }
    }
  });
}

exports.deleteTestSubject = (id, res) => {
  TestSubject.findByIdAndRemove(id, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.json({name: 'Failed', message: 'This id doesn\'t exist'});
      }
      else {
        res.json({name: 'Success', message: 'Test subject successfully deleted', test: data});
      }
    }
  });
}

exports.getOptionsOfConfig = (subjectName, configName, res) => {
  TestSubject.aggregate([
    {"$unwind": "$configuration"},
    {"$match": {"configuration.name": configName, "name": subjectName}},
    {"$group": {"_id": "$configuration.options"}}
  ])
  .exec((err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data.length === 1) {
        res.json(data[0]['_id']);
      } else {
        res.json({'error': 'Nothing found'});
      }
    }
  });
}
