var multer = require('multer');
var fs = require('fs');
var archiver = require('archiver');
var request = require('request');
var mongoose = require('mongoose');
var Test = mongoose.model('Test');
var User = require('../models/user_model');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';
var maxFileNumber = 50;

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'archives/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({storage: storage});

module.exports = function(app) {
  // POST: Upload files to the server in a ZIP. The name of the archive is the ID of the test
  // **(user must have write permission)**
  app.post('/api/upload', upload.array('files', maxFileNumber), function(req, res, next) {
    User.hasAuthorization(req, ['write_permission'])
    .then((hasAuthorization) => {
      if (hasAuthorization) {
        console.log('*** Upload ***');
        console.log(req.body);
        if (!req.body.files) {
          console.log('Failed, no file received');
          return res.status(400).send({
            status: 'Failed',
            message: 'No file received',
          });
        }

        // create a file to stream archive data to.
        var output = fs.createWriteStream('archives/' + req.body.testId + '.zip');
        var archive = archiver('zip', {
          zlib: {level: 9}, // Sets the compression level.
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

        new Promise(function(resolve) {
          // get the test to include a txt file with its configuration in the archive
          request.get({
            url: 'http://localhost:8000/api/tests/YAMLformat/id/' + req.body.testId,
            json: true,
          }, (err, res, test) => {
            fs.writeFile('archives/info.txt', test, (error) => {
              if (error) {
                console.log(error);
              }
              archive.append(fs.createReadStream('archives/info.txt'), {name: 'info.txt'});
              resolve();
            });
          });
        }).then(function() {
          if (typeof req.body.files === 'string') {
            // only one file uploaded
            var file = 'archives/' + req.body.files;
            archive.append(fs.createReadStream(file), {name: req.body.files});
          } else {
            // multiple files uploaded
            req.body.files.forEach(function(filename) {
              var file = 'archives/' + filename;
              archive.append(fs.createReadStream(file), {name: filename});
            });
          }

          // zip the files
          archive.finalize()
          .then(function() {
            // then, delete the raw files (not in the zip)
            if (typeof req.body.files === 'string') {
              // only one file uploaded
              var file = 'archives/' + req.body.files;
              fs.unlink(file, (err) => {});
            } else {
              // multiple files uploaded
              req.body.files.forEach(function(filename) {
                var file = 'archives/' + filename;
                fs.unlink(file, (err) => {});
              });
            }
            fs.unlink('archives/info.txt', (err) => {});

            // update the test with the content of the archive
            request.get({
              url: 'http://localhost:8000/api/archive/id/' + req.body.testId,
              json: true,
            }, (err2, res2, files) => {
              Test.findByIdAndUpdate(req.body.testId, {'$set': {'archiveContent': files}}, {new: true}, (err, test) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(test);
                  return res.status(200).send({
                    status: 'Success',
                    testId: req.body.testId,
                    uploadedFiles: req.body.files,
                  });
                }
              });
            });
          });
        });
      } else {
        res.status(401).send(error401);
      }
    });
  });

  app.post('/api/upload/newfiles', upload.array('files', maxFileNumber), function(req, res, next) {
    // POST: Upload files to the server (not zipped), to put them in an existing archive
    // **(user must have write permission)**
    User.hasAuthorization(req, ['write_permission'])
    .then((hasAuthorization) => {
      if (hasAuthorization) {
        res.send('okay');
        console.log('okay');
      } else {
        res.status(401).send(error401);
      }
    });
  });
};
