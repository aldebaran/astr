var fs = require('fs-extra');
var multer = require('multer');
var uploadController = require('../controllers/upload_controller');
var mongoose = require('mongoose');
var Application = mongoose.model('Application');
var maxFileNumber = 50;

module.exports = function(app) {
  Application.findOne({}, (err, application) => {
    if (err) {
      console.log(err);
    } else {
      var storage = multer.diskStorage({
        destination: function(req, file, cb) {
          fs.mkdirp(application.archivesPath + '/' + req.body.archiveId + '_temp', () => {
            cb(null, application.archivesPath + '/' + req.body.archiveId + '_temp');
          });
        },
        filename: function(req, file, cb) {
          cb(null, file.originalname);
        },
      });

      var upload = multer({storage: storage});

      // POST: Upload files to the server in a ZIP. The name of the zip is the ID of the archive
      // user must have write permission
      app.post('/api/upload', upload.array('files', maxFileNumber), uploadController.newArchive);

      // POST: Replace zip with a new one
      // user must have write permission
      app.post('/api/upload/replace-zip', upload.array('files', maxFileNumber), uploadController.replaceArchive);
    }
  });
};
