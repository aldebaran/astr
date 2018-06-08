const url = require('url');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Filter = mongoose.model('Filter');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

exports.getAllFilters = (req, res) => {
  Filter.find({}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.addFilter = (req, res) => {
  User.hasAuthorization(req, [])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var newFilter = new Filter(req.body);
      newFilter.created = Date.now();
      newFilter.save((err, data) => {
        if (err) {
          res.send(err);
        }
        else {
          res.json({name: 'Success', message: 'Filter successfully added', filter: data});
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}

exports.getFilter = (req, res) => {
  const id = req.params.id;
  Filter.findById(id, (err, data) => {
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

exports.deleteFilter = (req, res) => {
  User.hasAuthorization(req, ['owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      Filter.findByIdAndRemove(id, (err, data) => {
        if (err) {
          res.send(err);
        }
        else {
          if(data === null){
            res.json({name: 'Failed', message: 'This id doesn\'t exist'});
          }
          else {
            res.json({name: 'Success', message: 'Filter successfully deleted', filter: data});
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}
