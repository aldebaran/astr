var mongoose = require('mongoose');
var uuidv4 = require('uuid/v4');
var md5 = require('md5');
var User = require('../models/user_model');
var request = require('request');
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
      res.status(404).json({name: 'Failed', message: 'This user id doesn\'t exist'});
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
      res.status(404).json({name: 'Failed', message: 'This email doesn\'t exist'});
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
      if('write_permission' in body || 'master' in body) {
        User.findByIdAndUpdate(id, body, {select: {password:0, tokens: 0}},(err, data) => {
          if (err) {
            res.status(404).json({name: 'Failed', message: 'This user id doesn\'t exist'});
          }
          else {
            res.json({name: 'Success', message: 'User successfully modified', modified: body, before: data});
          }
        });
      } else {
        res.status(400).json({name: 'Failed', message: 'Only the variable "write_permission" and "master" can be modified'});
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
          res.status(404).json({name: 'Failed', message: 'This user id doesn\'t exist'});
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
        // create a new session-token
        request.get({
            url: 'http://localhost:8000/api/user/newToken/session',
            json: true,
            body: {
              userId: user._id
            }
        }, (err2, res2, token) => {
          if (err2) {
            console.log(err2);
          } else {
            return res.cookie('session-token', token.key, {maxAge: 24*60*60*1000}).redirect('/'); // expires after 1 day
          }
        });
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    // Login
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;

        // delete expired tokens
        deleteExpiredTokens(user._id);

        // create a new session-token
        request.get({
            url: 'http://localhost:8000/api/user/newToken/session/session',
            json: true,
            body: {
              userId: user._id
            }
        }, (err2, res2, token) => {
          if (err2) {
            console.log(err2);
          } else {
            return res.cookie('session-token', token.key, {maxAge: 24*60*60*1000*30}).redirect('/'); // expires after 30 days
          }
        });
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
          });
        } else {
          return res.json({
            id: user['_id'],
            name: user.firstname + ' ' + user.lastname,
            email: user.email,
            write_permission: user.write_permission,
            master: user.master,
            tokens: user.tokens
          })
        }
      }
    });
};

// GET: Log out the user logged in the machine
exports.logout = (req, res, next) => {
  if (req.session) {
    // delele session-tokken in database
    if (req.cookies['session-token']) {
      User.findByIdAndUpdate(req.session.userId, { '$pull': { 'tokens': { 'key': md5(req.cookies['session-token']) }}})
        .exec(function (error, user) {
          if (error) {
            console.log(error);
          } else {
            if (user === null) {
              console.log('User not found');
            }
          }
        });
    }

    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        // delete session token in cookies
        return res.clearCookie('session-token').redirect('/');
      }
    });
  }
};

exports.newToken = (req, res, next) => {
  var userId = '';
  if (req.session.userId) {
    userId = req.session.userId;
  } else {
    userId = req.body.userId;
  }
  var key = uuidv4();
  var expires = new Date();
  var type = req.params.type;
  if (type === 'session') {
    expires.setDate(expires.getDate() + 30) // 30 days
    req.params.name = 'session';
  } else if (type === 'persistent') {
    expires.setDate(expires.getDate() + 365) // 365 days
  }

  var token = {
    key: md5(key),
    name: req.params.name,
    expires: expires
  };
  User.findByIdAndUpdate(userId, { '$push': { 'tokens': token }})
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.status(404).json({
            error: 'Not connected'
          });
        } else {
          return res.json({
            'key': key,
            'expires': expires
          })
        }
      }
    });
}

exports.deleteToken = (req, res, next) => {
  User.hasAuthorization(req, [])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var userId = '';
      if (req.session.userId) {
        userId = req.session.userId;
      } else {
        userId = req.body.userId;
      }
      const id = req.params.id;

      User.findByIdAndUpdate(userId, { '$pull': { 'tokens': {'_id': mongoose.Types.ObjectId(id) }}})
        .exec(function (error, user) {
          if (error) {
            return next(error);
          } else {
            if (user === null) {
              return res.status(404).json({
                error: 'Not connected'
              });
            } else {
              return res.json({
                name: 'Success',
                message: 'Token successfully deleted'
              });
            }
          }
        });
    } else {
      res.status(401).send(error401);
    }
  });
}

function deleteExpiredTokens(userId) {
  var today = new Date();
  User.findByIdAndUpdate(userId, { '$pull': { 'tokens': { 'expires': { '$lte': today } }}})
    .exec(function (error, user) {
      if (error) {
        console.log(error);
      } else {
        if (user === null) {
          console.log('User not found');
        }
      }
    });
}
