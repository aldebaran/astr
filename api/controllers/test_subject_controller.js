var mongoose = require('mongoose');
var User = require('../models/user_model');
var TestSubject = mongoose.model('TestSubject');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of all test subjects
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

// POST:  Add a new test subject in the DB in function of the parameters given in the body request
exports.addTestSubject = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
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
    } else {
      res.status(401).send(error401);
    }
  });
}

// GET: Returns the test subject with the associated ID
exports.getTestSubject = (req, res) => {
  const id = req.params.id;
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

// GET: Returns the test subject with the associated name
exports.getTestSubjectByName = (req, res) => {
  const name = req.params.name;
  TestSubject.findOne({name: name}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      if(data === null){
        res.json({name: 'Failed', message: 'This name doesn\'t exist'});
      }
      else {
        res.json(data);
      }
    }
  });
}

// POST:  Update the test subject with the associated ID in function of the parameters given in the body request
exports.updateTestSubject = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      const body = req.body;
      if (body.emptyConfiguration) {
        body.configuration = [];
      }
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
    } else {
      res.status(401).send(error401);
    }
  });
}

// DELETE: Delete the test subject with the associated ID
exports.deleteTestSubject = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
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
    } else {
      res.status(401).send(error401);
    }
  });
}

// GET: Returns the test subject with the associated ID
exports.getOptionsOfConfig = (req, res) => {
  const subjectName = req.params.subject;
  const configName = req.params.configName;
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
