var mongoose = require('mongoose');
var uuidv1 = require('uuid/v1');
var md5 = require('md5');
var User = require('../models/user_model');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of all the users
exports.getAllUsers = (req, res) => {
  User.find({},{password:0, tokens: 0}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the list of all the masters
exports.getAllMasters = (req, res) => {
  User.find({master: true},{password:0, tokens: 0}, (err, data) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the user with the associated ID
exports.getUser = (req, res) => {
  const id = req.params.id;
  User.findById(id, {password: 0, tokens: 0}, (err, data) => {
    if (err) {
      res.json({name: 'Failed', message: 'This user id doesn\'t exist'});
    }
    else {
      res.json(data);
    }
  });
};

// GET: Returns the user with the associated email
exports.getUserByEmail = (req, res) => {
  const email = req.params.email;
  User.findOne({email: email}, {password: 0, tokens: 0}, (err, data) => {
    if (err) {
      res.json({name: 'Failed', message: 'This user id doesn\'t exist'});
    }
    else {
      res.json(data);
    }
  });
};

// POST:  Update the user with the associated ID in function of the parameters given in the body request
// (only the variable write_permission and master can be modified)
exports.updateUser = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      var body = req.body;
      if(body.master == 'true') {
        body['write_permission'] = true;
      }
      if('write_permission' in body || 'master' in body){
        User.findByIdAndUpdate(id, body, {select: {password:0, tokens: 0}},(err, data) => {
          if (err) {
            res.json({name: 'Failed', message: 'This user id doesn\'t exist'});
          }
          else {
            res.json({name: 'Success', message: 'User successfully modified', modified: body, before: data});
          }
        });
      } else {
        res.json({name: 'Failed', message: 'Only the variable "write_permission" and "master" can be modified'});
      }
    } else {
      res.status(401).send(error401);
    }
  });
};

// DELETE: Delete the user with the associated ID
exports.deleteUser = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      User.findByIdAndRemove(id, {password: 0, tokens: 0}, (err, data) => {
        if (err) {
          res.send(err);
        }
        if(data === null) {
          res.json({name: 'Failed', message: 'This user id doesn\'t exist'});
        }
        else {
          res.json({name: 'Success', message: 'User successfully deleted', user: data});
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// POST: Used for connection if the body contains logemail and logpassword;
// or for adding a new user if the body contains email, firstname, lastname, password and passwordConf
exports.AddUserAndLogin = (req, res, next) => {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email && req.body.firstname && req.body.lastname && req.body.password && req.body.passwordConf) {
    // add a new user
    var userData = {
      email: req.body.email,
      firstname: req.body.firstname[0].toUpperCase() + req.body.firstname.substring(1).toLowerCase(),
      lastname: req.body.lastname.toUpperCase(),
      password: req.body.password,
      write_permission: false,
      master: false,
      tokens: []
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    // connexion
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
};

// GET: Returns the information about the user logged in the machine
exports.getProfile = (req, res, next) => {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.json({
            error: 'Not connected'
          })
        } else {
          return res.json({
            id: user['_id'],
            name: user.firstname + ' ' + user.lastname,
            email: user.email,
            tokens: user.tokens,
            write_permission: user.write_permission,
            master: user.master,
          })
        }
      }
    });
};

// GET: Log out the user logged in the machine
exports.logout = (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
};

exports.newToken = (req, res, next) => {
  var key = uuidv1();
  var expires = new Date();
  expires.setDate(expires.getDate() + 7)

  var token = {
    key: md5(key),
    expires: expires
  };
  User.findByIdAndUpdate(req.session.userId, { '$push': { 'tokens': token }})
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.json({
            error: 'Not connected'
          })
        } else {
          return res.json({
            'token': key,
            'expires': expires
          })
        }
      }
    });
}
