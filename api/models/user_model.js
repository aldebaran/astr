var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var uuidv1 = require('uuid/v1');

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

//authenticate input against database
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

//hashing a password before saving it to the database
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

UserSchema.statics.hasAuthorization = function (req) {
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
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}
// User.hasAuthorization(req)
// .then((hasAuthorization) => {
//   if (hasAuthorization) {
//
//   } else {
//     res.status(401).send(error401);
//   }
// });

var User = mongoose.model('User', UserSchema);
module.exports = User;
