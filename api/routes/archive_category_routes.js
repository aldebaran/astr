module.exports = function(app) {
  var archiveCategory = require('../controllers/archive_category_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/categories')
  .get(archiveCategory.getAllArchiveCategories) // GET: Returns the list of all archive categories
  .post(archiveCategory.addArchiveCategory); // POST:  Add a new archive category in the DB in function of the parameters given in the body request

  app.route('/api/categories/id/:id')
  .get(archiveCategory.getArchiveCategory) // GET: Returns the archive category with the associated ID
  .post(archiveCategory.updateArchiveCategory) // POST: Update the archive category with the associated ID in function of the parameters given in the body request
  .delete(archiveCategory.deleteArchiveCategory); // DELETE: Delete the archive category with the associated ID

  app.route('/api/categories/name/:name')
  .get(archiveCategory.getArchiveCategoryByName); // GET: Returns the archive category with the associated name

  app.route('/api/categories/options/:category/:configName')
  .get(archiveCategory.getOptionsOfConfig); // GET: Returns the options of a configuration

  app.route('/api/categories/links/:category')
  .get(archiveCategory.getLinksOfArchiveCategory); // GET: Returns the links of an archive category
};
