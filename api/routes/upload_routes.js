var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'archives/')
  },
  filename: function (req, file, cb) {
    if(req.body.testId){
      cb(null, req.body.testId)
    }
  }
})

var upload = multer({ storage: storage });

module.exports = function(app) {
  app.post( '/upload', upload.single( 'file' ), function( req, res, next ) {
    return res.status( 200 ).send( req.file );
  });
};
