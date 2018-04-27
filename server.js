var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Test = require('./api/models/test_model');
Test = mongoose.model('Test');
var TestSubject = require('./api/models/test_subject_model');
TestSubject = mongoose.model('TestSubject');

//Connection to mongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ASTR');
var db = mongoose.connection;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

//Routes for the mongoDB API
//importing route
var testRoutes = require('./api/routes/test_routes');
var testSubjectRoutes = require('./api/routes/test_subject_routes');
var userRoutes = require('./api/routes/user_routes');
var uploadRoutes = require('./api/routes/upload_routes');

//register the route
testRoutes(app);
testSubjectRoutes(app);
userRoutes(app);
uploadRoutes(app);

//Start the server
app.listen(port);

console.log('Server started on port ' + port);
