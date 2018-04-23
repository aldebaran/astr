module.exports = function(app) {
  var User = require('../models/user_model');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  //GET all users
  app.get('/api/user', function(req, res){
    User.find({},{password:0}, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  })

  //GET all masters
  app.get('/api/user/master', function(req, res){
    User.find({master: true},{password:0}, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  })

  //GET specific user specifying the ID
  app.get('/api/user/id/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id, {password: 0}, (err, data) => {
      if (err) {
        res.json({name: 'Failed', message: 'This user id doesn\'t exist'});
      }
      else {
        res.json(data);
      }
    });
  });

  //POST: modify value of write_permission and master
  app.post('/api/user/id/:id', (req, res) => {
    const id = req.params.id;
    var body = req.body;
    if(body.master == 'true') {
      body['write_permission'] = true;
    }
    if(body['write_permission'] || body.master){
      User.findByIdAndUpdate(id, body, {select: {password:0}},(err, data) => {
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
  });

  //GET specific user specifying the ID
  app.delete('/api/user/id/:id', (req, res) => {
    const id = req.params.id;
    User.findByIdAndRemove(id, {password: 0}, (err, data) => {
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
              id: user['_id'],
              name: user.firstname + ' ' + user.lastname,
              email: user.email,
              write_permission: user.write_permission,
              master: user.master,
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
