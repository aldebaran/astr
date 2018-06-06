var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var uuidv1 = require('uuid/v1');
var request = require('request');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  firstname: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: false,
  },
  write_permission: {
    type: Boolean,
    required: false,
  },
  master: {
    type: Boolean,
    required: false,
  },
  token: {
    type: String,
    required: false,
  }
});

// authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

// hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  user.token = uuidv1();
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

UserSchema.statics.hasAuthorization = function (req, permissions) {
  // permissions -> Array ['master', 'write_permission', 'owner']
  return new Promise((resolve) => {
    if (req.headers.authorization) {
      var tmp = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString();
      var auth = {
        email: tmp.split(':')[0],
        token: tmp.split(':')[1]
      };
      User.findOne({email: auth.email}, (err, user) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else if (user && user.token === auth.token) {
          if (permissions.length > 0) {
            if (permissions.includes('master') && user.master === true) {
              // require to be master
              resolve(true);
            } else if (permissions.includes('write_permission') && user.write_permission === true) {
              // require to have write_permission
              resolve(true);
            } else if (permissions.includes('owner') && req.url.includes('tests')) {
              // require to have be owner of the test
              request('http://' + req.get('host') + '/api/tests/id/' + req.params.id, {json: true}, (err2, res2, test) => {
                if (test.author === user.firstname + ' ' + user.lastname) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            } else if (permissions.includes('owner') && req.url.includes('filters')) {
              // require to have be owner of the filter
              request('http://' + req.get('host') + '/api/filters/id/' + req.params.id, {json: true}, (err2, res2, filter) => {
                if (filter.user === user.firstname + ' ' + user.lastname) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            } else {
              resolve(false);
            }
          } else {
            // No permissions needed except authentication
            resolve(true);
          }
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}
// User.hasAuthorization(req, ['master', 'write_permission', 'owner'])
// .then((hasAuthorization) => {
//   if (hasAuthorization) {
//
//   } else {
//     res.status(401).send(error401);
//   }
// });

var User = mongoose.model('User', UserSchema);
module.exports = User;
