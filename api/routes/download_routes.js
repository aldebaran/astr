var download = require('../controllers/download_controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/download/files')
  .get(download.getFiles); // GET: Returns the list of files in archives folder

  app.route('/api/download/id/:id')
  .get(download.downloadById); // GET: Download the archive of the test with the associated ID

  app.route('/api/download/multiple')
  .post(download.multiple); // POST: Download a ZIP containing the archives of multiple tests. The test IDs to download are passed in the body request.
};
