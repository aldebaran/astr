var fs = require('fs');
var archiver = require('archiver');
var mongoose = require('mongoose');
var Archive = mongoose.model('Archive');

// GET: Returns the list of files in archives folder
exports.getFiles = (req, res, next) => {
  fs.readdir('archives/', (err, files) => {
    if (files) {
      res.json(files.map((file) => file.split('.')[0]));
    } else {
      res.json([]);
    }
  });
};

// GET: Download the zip of the archive with the associated ID
exports.downloadById = (req, res, next) => {
  var id = req.params.id;
  var filePath = 'archives/';
  if (id === 'multiple') {
    var fileName = 'multiple.zip';
    res.download(filePath + fileName);
  } else {
    Archive.findById(id, (err, archive) => {
      if (err) {
        res.status(500).send(err);
      } else {
        if (archive === null) {
          res.status(404).json({
            name: 'Failed',
            message: 'This archive id doesn\'t exist',
          });
        } else if (archive.isDownloadable === true) {
          var fileName = req.params.id + '.zip';
          res.download(filePath + fileName);
        } else {
          res.status(500).json({
            name: 'Failed',
            message: 'The archive is not downloadable. Probably because it is being zipped.',
          });
        }
      }
    });
  }
};

// POST: Download a ZIP containing multiple archives. The archive IDs to download are passed in the body request.
exports.multiple = (req, res, next) => {
  var archivesToDownload = req.body.ids;

  // create a file to stream archive data to.
  var output = fs.createWriteStream('archives/' + 'multiple' + '.zip');
  var archive = archiver('zip');

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

  archivesToDownload.forEach(function(id) {
    var file = 'archives/' + id + '.zip';
    archive.append(fs.createReadStream(file), {name: (id + '.zip')});
  });

  // zip the files
  archive.finalize()
  .then(function() {
    return res.status(200).send(req.file);
  });
};
