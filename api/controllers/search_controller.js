const url = require('url');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Search = mongoose.model('Search');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

exports.getAllSearch = (req, res) => {
  Search.find({}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

exports.addSearch = (req, res) => {
  User.hasAuthorization(req, [])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var newSearch = new Search(req.body);
      newSearch.created = Date.now();
      newSearch.save((err, data) => {
        if (err) {
          res.send(err);
        }
        else {
          res.json({name: 'Success', message: 'Search successfully added', search: data});
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}

exports.getSearch = (req, res) => {
  const id = req.params.id;
  Search.findById(id, (err, data) => {
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

exports.deleteSearch = (req, res) => {
  User.hasAuthorization(req, ['owner'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      Search.findByIdAndRemove(id, (err, data) => {
        if (err) {
          res.send(err);
        }
        else {
          if(data === null){
            res.json({name: 'Failed', message: 'This id doesn\'t exist'});
          }
          else {
            res.json({name: 'Success', message: 'Search successfully deleted', search: data});
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
}
