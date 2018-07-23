var fs = require('fs-extra');
var multer = require('multer');
var uploadController = require('../controllers/upload_controller');
var maxFileNumber = 50;

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    fs.mkdirp('archives/' + req.body.testId + '_temp', () => {
      cb(null, 'archives/' + req.body.testId + '_temp');
    });
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({storage: storage});

module.exports = function(app) {
  // POST: Upload files to the server in a ZIP. The name of the archive is the ID of the test
  // user must have write permission
  app.post('/api/upload', upload.array('files', maxFileNumber), uploadController.newArchive);

  // POST: Replace archive with a new one
  // user must have write permission
  app.post('/api/upload/replace-archive', upload.array('files', maxFileNumber), uploadController.replaceArchive);
};
