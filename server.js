var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var Test = require('./api/models/test_model');
Test = mongoose.model('Test');
var TestSubject = require('./api/models/test_subject_model');
TestSubject = mongoose.model('TestSubject');
var Search = require('./api/models/search_model');
Search = mongoose.model('Search');

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
var testRoutes = require('./api/routes/test_routes');
var testSubjectRoutes = require('./api/routes/test_subject_routes');
var searchRoutes = require('./api/routes/search_routes');
var userRoutes = require('./api/routes/user_routes');
var uploadRoutes = require('./api/routes/upload_routes');
var downloadRoutes = require('./api/routes/download_routes');
var archiveRoutes = require('./api/routes/archive_routes');
var statsRoutes = require('./api/routes/stats_routes');

// register the routes
testRoutes(app);
testSubjectRoutes(app);
searchRoutes(app);
userRoutes(app);
uploadRoutes(app);
downloadRoutes(app);
archiveRoutes(app);
statsRoutes(app);

// start the server
app.listen(port);

console.log('Server started on port ' + port);
