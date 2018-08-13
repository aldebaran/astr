var mongoose = require('mongoose');
var Application = mongoose.model('Application');
var User = require('../models/user_model');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns information about the application (name, version, creation date, lastBootUptime)
exports.getAppInfo = (req, res) => {
  Application.findOne({}, {_id: 0, __v: 0}, (err, application) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(application);
    }
  });
};

// POST: Change the name of the application (to allow using a custom name) **(user must be master)**
exports.changeName = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var name = req.body.name;
      if (name && name.trim() !== '') {
        Application.findOneAndUpdate({}, {'$set': {'name': name}}, {new: true}, (err, data) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(data);
          }
        });
      } else {
        res.send('Error: name is not valid.');
      }
    } else {
      res.status(401).send(error401);
    }
  });
};
