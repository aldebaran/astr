var fs = require('fs-extra');
var Archiver = require('archiver');
var request = require('request');
var mongoose = require('mongoose');
var User = require('../models/user_model');
var Archive = mongoose.model('Archive');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// POST: Upload files to the server in a ZIP. The name of the zip is the ID of the archive
// user must have write permission
exports.newArchive = (req, res, next) => {
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

      var pathTempFolder = 'archives/' + req.body.archiveId + '_temp/';
      var output = fs.createWriteStream('archives/' + req.body.archiveId + '.zip');
      var archiver = Archiver('zip', {
        zlib: {level: 0}, // Sets the compression level.
      });

      output.on('close', function() {
        console.log(archiver.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        // then, delete the raw files (in temporary folder)
        fs.remove(pathTempFolder, (err) => {
          if (err) {
            console.log(err);
          }
        });

        // update archive: isDownloadable = true
        Archive.findByIdAndUpdate(req.body.archiveId, {'$set': {'isDownloadable': true}}, (err) => {
          if (err) {
            console.log(err);
          }
        });

        setTimeout(() => {
          return res.status(200).send({
            status: 'Success',
            archiveId: req.body.archiveId,
            uploadedFiles: req.body.files,
          });
        }, 1000);
      });

      output.on('end', function() {
        console.log('Data has been drained');
      });

      archiver.on('warning', function(err) {
        console.log(err);
      });

      archiver.pipe(output);

      archiver.on('error', function(err) {
        console.log(err);
      });

      new Promise(function(resolve) {
        // get the archive to include a txt file with its configuration in the zip
        request.get({
          url: 'http://localhost:' + req.connection.localPort + '/api/archives/YAMLformat/id/' + req.body.archiveId,
          json: true,
        }, (err, res, archive) => {
          fs.writeFile(pathTempFolder + 'info.txt', archive, (error) => {
            if (error) {
              console.log(error);
            }
            archiver.append(fs.createReadStream(pathTempFolder + 'info.txt'), {name: 'info.txt'});
            resolve();
          });
        });
      }).then(function() {
        if (typeof req.body.files === 'string') {
          // only one file uploaded
          var file = pathTempFolder + req.body.files;
          archiver.append(fs.createReadStream(file), {name: req.body.files});
        } else {
          // multiple files uploaded
          req.body.files.forEach(function(filename) {
            var file = pathTempFolder + filename;
            archiver.append(fs.createReadStream(file), {name: filename});
          });
        }

        // zip the files
        archiver.finalize()
        .then(function() {
          console.log('The files are being zipped...');
        });
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// POST: Replace zip with a new one
// user must have write permission
exports.replaceArchive = (req, res, next) => {
  User.hasAuthorization(req, ['write_permission'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      console.log('*** Upload - replace zip ***');
      console.log(req.body);
      if (!req.body.files) {
        console.log('Failed, no file received');
        return res.status(400).send({
          status: 'Failed',
          message: 'No file received',
        });
      }

      var pathTempFolder = 'archives/' + req.body.archiveId + '_temp/';
      var output = fs.createWriteStream('archives/' + req.body.archiveId + '.zip');
      var archiver = Archiver('zip', {
        zlib: {level: 0}, // Sets the compression level.
      });

      output.on('close', function() {
        console.log(archiver.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        console.log(req.body.archiveId + '.zip has been replaced');
        // then, delete the raw files (in temporary folder)
        fs.remove(pathTempFolder, (err) => {
          if (err) {
            console.log(err);
          }
        });

        // update archive: isDownloadable = true
        Archive.findByIdAndUpdate(req.body.archiveId, {'$set': {'isDownloadable': true}}, (err) => {
          if (err) {
            console.log(err);
          }
        });

        setTimeout(() => {
          return res.status(200).send({
            status: 'Success',
            archiveId: req.body.archiveId,
            uploadedFiles: req.body.files,
          });
        }, 1000);
      });

      output.on('end', function() {
        console.log('Data has been drained');
      });

      archiver.on('warning', function(err) {
        console.log(err);
      });

      archiver.pipe(output);

      archiver.on('error', function(err) {
        console.log(err);
      });

      new Promise(function(resolve) {
        // get the archive to include a txt file with its configuration in the zip
        request.get({
          url: 'http://localhost:' + req.connection.localPort + '/api/archives/YAMLformat/id/' + req.body.archiveId,
          json: true,
        }, (err, res, archive) => {
          fs.writeFile(pathTempFolder + 'info.txt', archive, (error) => {
            if (error) {
              console.log(error);
            }
            archiver.append(fs.createReadStream(pathTempFolder + 'info.txt'), {name: 'info.txt'});
            resolve();
          });
        });
      }).then(function() {
        if (typeof req.body.files === 'string') {
          // only one file uploaded
          var file = pathTempFolder + req.body.files;
          archiver.append(fs.createReadStream(file), {name: req.body.files});
        } else {
          // multiple files uploaded
          req.body.files.forEach(function(filename) {
            var file = pathTempFolder + filename;
            archiver.append(fs.createReadStream(file), {name: filename});
          });
        }

        // zip the files
        archiver.finalize()
        .then(function() {
          console.log('The files are being zipped...');
        });
      });
    } else {
      res.status(401).send(error401);
    }
  });
};
