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
