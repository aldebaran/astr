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

var Archive = require('./api/models/archive_model');
var ArchiveCategory = require('./api/models/archive_category_model');
var Search = require('./api/models/search_model');
var Application = require('./api/models/application_model');

Archive = mongoose.model('Archive');
ArchiveCategory = mongoose.model('ArchiveCategory');
Search = mongoose.model('Search');
Application = mongoose.model('Application');

// use port passed in command line argument if exists
if (process.argv.length > 2 && !isNaN(process.argv[2])) {
  port = process.argv[2];
}

// create the folder to store archives
fs.mkdirp('archives/', (err) => {
  if (err) {
    console.log(err);
  }
});

// connection to mongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ASTR');
var db = mongoose.connection;

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
var archiveRoutes = require('./api/routes/archive_routes');
var archiveCategoryRoutes = require('./api/routes/archive_category_routes');
var searchRoutes = require('./api/routes/search_routes');
var userRoutes = require('./api/routes/user_routes');
var uploadRoutes = require('./api/routes/upload_routes');
var downloadRoutes = require('./api/routes/download_routes');
var statsRoutes = require('./api/routes/stats_routes');
var applicationRoutes = require('./api/routes/application_routes');

// register the routes
archiveRoutes(app);
archiveCategoryRoutes(app);
searchRoutes(app);
userRoutes(app);
uploadRoutes(app);
downloadRoutes(app);
statsRoutes(app);
applicationRoutes(app);

// start the server
app.listen(port);

// update application info
request.post('http://localhost:' + port + '/api', () => {});

console.log('ASTR started on port ' + port);
