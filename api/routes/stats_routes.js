module.exports = function(app) {
  var stats = require('../controllers/stats_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/stats/tests-frequency')
  .get(stats.getTestFrequency);

  app.route('/api/stats/disk-usage')
  .get(stats.getDiskUsage);
};
