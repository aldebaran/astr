//Modules
var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var mongoose = require('mongoose');
var Test = require('./api/models/test_model');
var bodyParser = require('body-parser');
Test = mongoose.model('Test');

//Connection to mongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/ASTR');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

//Routes for html files

//Routes for css and js files
app.get('/public/css/index.css',function(req,res){
	res.sendFile( __dirname +"/public/css/" +"index.css");
})
app.get('/public/js/index.js',function(req,res){
	res.sendFile( __dirname +"/public/js/" +"index.js");
})

//Routes for the mongoDB API
var routes = require('./api/routes/test_routes'); //importing route
routes(app); //register the route

//Start the server
app.listen(port);

console.log('Server started on port ' + port);
