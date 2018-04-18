module.exports = function(app) {
  var User = require('../models/user_model');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


  //POST route for updating data
  app.post('/api/user', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      res.send("passwords dont match");
      return next(err);
    }

    if (req.body.email &&
      req.body.firstname &&
      req.body.lastname &&
      req.body.password &&
      req.body.passwordConf) {

      var userData = {
        email: req.body.email,
        firstname: req.body.firstname[0].toUpperCase() + req.body.firstname.substring(1).toLowerCase(),
        lastname: req.body.lastname.toUpperCase(),
        password: req.body.password,
        write_permission: false,
        master: false,
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
  })

  // GET route after registering
  app.get('/api/user/profile', function (req, res, next) {
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
              name: user.firstname + ' ' + user.lastname,
              email: user.email
            })
          }
        }
      });
  });

  // GET for logout logout
  app.get('/api/user/logout', function (req, res, next) {
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
  });



};
