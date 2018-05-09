module.exports = function(app) {
  var configuration = require('../controllers/configuration_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/configurations')
    .get(configuration.getAllConfigurations)
    .post(configuration.addConfiguration);

  app.get('/api/configurations/id/:id', (req, res) => {
    const id = req.params.id;
    configuration.getConfiguration(id, res);
  });

  app.delete('/api/configurations/id/:id', (req, res) => {
    const id = req.params.id;
    configuration.deleteConfiguration(id, res);
  });

};
