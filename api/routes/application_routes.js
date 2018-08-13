module.exports = function(app) {
  var application = require('../controllers/application_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api')
  .get(application.getAppInfo); // GET: Returns information about the application (name, version, creation date, lastBootUptime)

  app.route('/api/change-app-name')
  .post(application.changeName); // POST: Change the name of the application (to allow using a custom name) **(user must be master)**
};
