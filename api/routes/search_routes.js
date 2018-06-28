module.exports = function(app) {
  var search = require('../controllers/search_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/search')
  .get(search.getAllSearch)
  .post(search.addSearch);

  app.route('/api/search/id/:id')
  .get(search.getSearch)
  .delete(search.deleteSearch);
};
