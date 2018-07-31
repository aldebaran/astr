module.exports = function(app) {
  var archive = require('../controllers/archive_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/archives')
  .get(archive.getAllArchives) // GET: Returns the list of all archives (sorted by creation date in descending order)
  .post(archive.getArchivesByQuery); // POST: Returns the list of archives that match with the parameters given in the body request (sorted by creation date in descending order)

  app.route('/api/archives/page/:page/:resultPerPage')
  .post(archive.getArchivesByQueryAndPage); // POST: Returns the list of archives that match with the parameters given in the body request, with pagination (sorted by creation date in descending order)

  app.route('/api/archives/add')
  .post(archive.addArchive); // POST: Add a new archive in the DB in function of the parameters given in the body request

  app.route('/api/archives/id/:id')
  .get(archive.getArchive) // GET: Returns the archive with the associated ID
  .post(archive.updateArchive) // POST: Update the archive with the associated ID in function of the parameters given in the body request (only the date, the comments, and the configuration values can be updated)
  .delete(archive.deleteArchive); // DELETE: Delete the archive with the associated ID

  app.route('/api/archives/YAMLformat/id/:id')
  .get(archive.getArchiveInYAMLFormat); // GET: Returns the archive with the associated ID in a YAML format, to store it in the zip

  app.route('/api/archives/authors')
  .get(archive.getDistinctAuthors); // GET: Returns the list of archive authors (that added at least one archive)

  app.route('/api/archives/categories')
  .get(archive.getDistinctCategories); // GET: Returns the list of archive categories (used at least by one archive)

  app.route('/api/archives/configurations')
  .get(archive.getDistinctConfigurations); // GET: Returns the list of configurations (used at least by one archive)

  app.route('/api/archives/configurations/:category')
  .get(archive.getConfigurationsOfArchiveCategory); // GET: Returns the list of configurations of the associated archive category (used at least by one archive)

  app.route('/api/archives/options/:configname')
  .get(archive.getOptionsOfConfig); // GET: Returns the  options of the associated configuration (used at least one time)

  app.route('/api/archives/changeArchiveCategoryName')
  .post(archive.changeArchiveCategoryName); // POST: Change the category name of all the archives matched by {category: previousName} (body contains previousName and newName)

  app.route('/api/archives/addConfig')
  .post(archive.addConfig); // POST: Push a new configuration in all archives matched by the archive category (body contains category and config: {name, value})

  app.route('/api/archives/changeConfigName')
  .post(archive.changeConfigName); // POST: Change the name of the matched configuration in all archives matched by the archive category (body contains category, previousName and newName)

  app.route('/api/archives/withoutZip')
  .get(archive.getAllMissingArchives); // GET: Returns the list of all archives that are missing in the folder "archives" (to delete them)
};
