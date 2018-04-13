var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose'),
  Test = mongoose.model('Test');

exports.getAllTests = function(req, res) {
  Test.find({}, function(err, data) {
    if (err)
      res.send(err);
    res.json(data);
  });
};

exports.getTest = function(id, res) {
  Test.findOne(new ObjectID(id), (err, data) => {
    if (err)
      res.send(err);
    res.json(data);
  });
};
