module.exports = function(app) {
  var filter = require('../controllers/filter_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/filters')
  .get(filter.getAllFilters)
  .post(filter.addFilter);

  app.route('/api/filters/id/:id')
  .get(filter.getFilter)
  .delete(filter.deleteFilter);

  app.route('/tests/:filterId')
  .get(filter.searchWithFilter);

};
