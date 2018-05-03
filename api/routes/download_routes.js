var fs = require('fs');
var archiver = require('archiver');

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Route to download one archive
  app.get('/api/download/id/:id', function (req, res, next) {
    var filePath = 'archives/'; // Or format the path using the `id` rest param
    var fileName = req.params.id + '.zip';
    res.download(filePath + fileName);
  });

  // Route to download multiple archives in one ZIP
  app.post('/api/download/multiple', function(req, res, next) {
    var testsToDownload = req.body.ids;

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

    testsToDownload.forEach(function(id){
      var file = 'archives/' + id + '.zip';
      archive.append(fs.createReadStream(file), { name: (id+'.zip') });
    })

    // zip the files
    archive.finalize()
    .then(function(){
      return res.status( 200 ).send( req.file );
    })
  })

};
