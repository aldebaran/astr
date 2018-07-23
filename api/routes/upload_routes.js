var multer = require('multer');
var fs = require('fs-extra');
var archiver = require('archiver');
var request = require('request');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Test = mongoose.model('Test');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';
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
        var pathTempFolder = 'archives/' + req.body.testId + '_temp/';
        var output = fs.createWriteStream('archives/' + req.body.testId + '.zip');
        var archive = archiver('zip', {
          zlib: {level: 0}, // Sets the compression level.
        });

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
          // then, delete the raw files (in temporary folder)
          fs.remove(pathTempFolder, (err) => {
            if (err) {
              console.log(err);
            }
          });

          // update test: isDownloadable = true
          Test.findByIdAndUpdate(req.body.testId, {'$set': {'isDownloadable': true}}, (err) => {
            if (err) {
              console.log(err);
            }
          });

          setTimeout(() => {
            return res.status(200).send({
              status: 'Success',
              testId: req.body.testId,
              uploadedFiles: req.body.files,
            });
          }, 1000);
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
          console.log('Data has been drained');
        });

        archive.on('warning', function(err) {
          console.log(err);
        });

        // pipe archive data to the file
        archive.pipe(output);

        archive.on('error', function(err) {
          console.log(err);
        });

        new Promise(function(resolve) {
          // get the test to include a txt file with its configuration in the archive
          request.get({
            url: 'http://localhost:' + req.connection.localPort + '/api/tests/YAMLformat/id/' + req.body.testId,
            json: true,
          }, (err, res, test) => {
            fs.writeFile(pathTempFolder + 'info.txt', test, (error) => {
              if (error) {
                console.log(error);
              }
              archive.append(fs.createReadStream(pathTempFolder + 'info.txt'), {name: 'info.txt'});
              resolve();
            });
          });
        }).then(function() {
          if (typeof req.body.files === 'string') {
            // only one file uploaded
            var file = pathTempFolder + req.body.files;
            archive.append(fs.createReadStream(file), {name: req.body.files});
          } else {
            // multiple files uploaded
            req.body.files.forEach(function(filename) {
              var file = pathTempFolder + filename;
              archive.append(fs.createReadStream(file), {name: filename});
            });
          }

          // zip the files
          archive.finalize()
          .then(function() {
            console.log('The files are being zipped...');
          });
        });
      } else {
        res.status(401).send(error401);
      }
    });
  });

  // POST: Replace archive with a new one
  // **(user must have write permission)**
  app.post('/api/upload/replace-archive', upload.array('files', maxFileNumber), function(req, res, next) {
    User.hasAuthorization(req, ['write_permission'])
    .then((hasAuthorization) => {
      if (hasAuthorization) {
        console.log('*** Upload - replace archive ***');
        console.log(req.body);
        if (!req.body.files) {
          console.log('Failed, no file received');
          return res.status(400).send({
            status: 'Failed',
            message: 'No file received',
          });
        }

        // create a file to stream archive data to.
        var pathTempFolder = 'archives/' + req.body.testId + '_temp/';
        var output = fs.createWriteStream('archives/' + req.body.testId + '.zip');
        var archive = archiver('zip', {
          zlib: {level: 0}, // Sets the compression level.
        });

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
          console.log(req.body.testId + '.zip has been replaced');
          // then, delete the raw files (in temporary folder)
          fs.remove(pathTempFolder, (err) => {
            if (err) {
              console.log(err);
            }
          });

          // update test: isDownloadable = true
          Test.findByIdAndUpdate(req.body.testId, {'$set': {'isDownloadable': true}}, (err) => {
            if (err) {
              console.log(err);
            }
          });

          setTimeout(() => {
            return res.status(200).send({
              status: 'Success',
              testId: req.body.testId,
              uploadedFiles: req.body.files,
            });
          }, 1000);
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
          console.log('Data has been drained');
        });

        archive.on('warning', function(err) {
          console.log(err);
        });

        // pipe archive data to the file
        archive.pipe(output);

        archive.on('error', function(err) {
          console.log(err);
        });

        new Promise(function(resolve) {
          // get the test to include a txt file with its configuration in the archive
          request.get({
            url: 'http://localhost:' + req.connection.localPort + '/api/tests/YAMLformat/id/' + req.body.testId,
            json: true,
          }, (err, res, test) => {
            fs.writeFile(pathTempFolder + 'info.txt', test, (error) => {
              if (error) {
                console.log(error);
              }
              archive.append(fs.createReadStream(pathTempFolder + 'info.txt'), {name: 'info.txt'});
              resolve();
            });
          });
        }).then(function() {
          if (typeof req.body.files === 'string') {
            // only one file uploaded
            var file = pathTempFolder + req.body.files;
            archive.append(fs.createReadStream(file), {name: req.body.files});
          } else {
            // multiple files uploaded
            req.body.files.forEach(function(filename) {
              var file = pathTempFolder + filename;
              archive.append(fs.createReadStream(file), {name: filename});
            });
          }

          // zip the files
          archive.finalize()
          .then(function() {
            console.log('The files are being zipped...');
          });
        });
      } else {
        res.status(401).send(error401);
      }
    });
  });
};
