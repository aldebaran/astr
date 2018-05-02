var multer = require('multer');
var fs = require('fs');
var archiver = require('archiver');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'archives/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });

module.exports = function(app) {
  app.post( '/api/upload', upload.array('files', 10), function( req, res, next ) {
    console.log('*** Upload ***')
    console.log(req.body)

    // create a file to stream archive data to.
    var output = fs.createWriteStream('archives/' + req.body.testId + '.zip');
    var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
      console.log('Data has been drained');
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.on('error', function(err) {
      throw err;
    });

    if(typeof req.body.files === 'string'){
      // only one file uploaded
      var file = 'archives/' + req.body.files;
      archive.append(fs.createReadStream(file), { name: req.body.files });
    } else {
      // multiple files uploaded
      req.body.files.forEach(function(filename){
        var file = 'archives/' + filename;
        archive.append(fs.createReadStream(file), { name: filename });
      })
    }

    // zip the files
    archive.finalize()
    .then(function(){
      // then, delete the raw files (not in the zip)
      if(typeof req.body.files === 'string'){
        // only one file uploaded
        var file = 'archives/' + req.body.files;
        fs.unlink(file, (err) => {
          if (err) throw err;
        });
      } else {
        // multiple files uploaded
        req.body.files.forEach(function(filename){
          var file = 'archives/' + filename;
          fs.unlink(file, (err) => {
            if (err) throw err;
          });
        })
      }
    })

    return res.status( 200 ).send( req.file );

  });
};
