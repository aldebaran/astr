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

  app.get('/api/filters/id/:id', (req, res) => {
    const id = req.params.id;
    filter.getFilter(id, res);
  });

  app.delete('/api/filters/id/:id', (req, res) => {
    const id = req.params.id;
    filter.deleteFilter(id, res);
  });

  app.get('/tests/:filterId', (req, res) => {
    const id = req.params.filterId;
    filter.searchWithFilter(id, res);
  });

};
