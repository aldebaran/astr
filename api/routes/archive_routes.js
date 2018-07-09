var archive = require('../controllers/archive_controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/archive/id/:id')
  .get(archive.getArchiveContent) // GET: Returns the list of files in the archive with the associated ID
  .post(archive.updateContent); // POST: Update the content of the archive with the associated ID. It is possible to delete files and add new ones. (two arrays can be in the body request: *"add"* and *"delete"*) **(user must be master or owner of the test)**
};
