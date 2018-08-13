var fs = require('fs-extra');
var request = require('request');
var express = require('express');
var app = express();
var port = process.env.PORT || 8000; // default port: env variable PORT or 8000
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Application = require('./api/models/application_model');
var Archive = require('./api/models/archive_model');
var ArchiveCategory = require('./api/models/archive_category_model');
var Search = require('./api/models/search_model');
Application = mongoose.model('Application');
Archive = mongoose.model('Archive');
ArchiveCategory = mongoose.model('ArchiveCategory');
Search = mongoose.model('Search');

// use port passed in command line argument if exists
if (process.argv.length > 2 && !isNaN(process.argv[2])) {
  port = process.argv[2];
}

// connection to mongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ASTR');
var db = mongoose.connection;

// initilization: create/update application document (containing app name, version, archive path, ...)
new Promise((resolve, reject) => {
  Application.findOne({}, (err, application) => {
    if (err) {
      reject(err);
    } else {
      fs.readFile('package.json', 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          json = JSON.parse(data);
          if (application === null) {
            // first initilization
            var info = {
              name: json.description,
              version: json.version,
              created: Date.now(),
              lastBootUptime: Date.now(),
            };
            application = new Application(info);
            application.save((err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(application);
              }
            });
          } else {
            // update version and lastBootUptime
            application.version = json.version;
            application.lastBootUptime = Date.now();
            Application.findByIdAndUpdate(application._id, application, {new: true}, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(application);
              }
            });
          }
        }
      });
    }
  });
}).then((application) => {
  // create the folder containing the archive if doesn't exist
  fs.mkdirp(application.archivesPath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static('public'));
  app.use(cookieParser());

  // use sessions for tracking logins
  app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db,
    }),
  }));

  // routes for the mongoDB API
  // importing routes
  var applicationRoutes = require('./api/routes/application_routes');
  var archiveRoutes = require('./api/routes/archive_routes');
  var archiveCategoryRoutes = require('./api/routes/archive_category_routes');
  var searchRoutes = require('./api/routes/search_routes');
  var userRoutes = require('./api/routes/user_routes');
  var uploadRoutes = require('./api/routes/upload_routes');
  var downloadRoutes = require('./api/routes/download_routes');
  var statsRoutes = require('./api/routes/stats_routes');

  // register the routes
  applicationRoutes(app);
  archiveRoutes(app);
  archiveCategoryRoutes(app);
  searchRoutes(app);
  userRoutes(app);
  uploadRoutes(app);
  downloadRoutes(app);
  statsRoutes(app);

  // start the server
  app.listen(port);

  console.log('ASTR started on port ' + port);

  // clean the folder containing the archives once a day
  request.get('http://localhost:' + port + '/api/archives/cleanArchivesFolder', () => {});
  setInterval(() => {
    request.get('http://localhost:' + port + '/api/archives/cleanArchivesFolder', () => {});
  }, 1000 * 60 * 60 * 24);
});
