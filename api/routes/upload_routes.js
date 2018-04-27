var multer = require('multer');
var upload = multer({ dest: 'archives/'});

module.exports = function(app) {
  app.post( '/upload', upload.single( 'file' ), function( req, res, next ) {
    return res.status( 200 ).send( req.file );
  });
};
