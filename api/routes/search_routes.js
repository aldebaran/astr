module.exports = function(app) {
  var search = require('../controllers/search_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/search')
  .get(search.getAllSearch) // GET: Returns the list of all saved searches
  .post(search.addSearch); // POST:  Add a new search in the DB in function of the parameters given in the body request **(user must use authentification)**

  app.route('/api/search/id/:id')
  .get(search.getSearch) // GET: Returns the search with the associated ID
  .delete(search.deleteSearch); // DELETE: Delete the search with the associated ID **(user must be the owner of the search)**
};
