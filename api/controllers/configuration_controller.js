var mongoose = require('mongoose'),
  Configuration = mongoose.model('Configuration');

  exports.getAllConfigurations = (req, res) => {
    Configuration.find({}, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  };

  exports.addConfiguration = (req, res) => {
    var newConfiguration = new Configuration(req.body);
    newConfiguration.created = Date.now();
    newConfiguration.save((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json({name: 'Success', message: 'Configuration successfully added', configuration: data});
      }
    });
  }

  exports.getConfiguration = (id, res) => {
    Configuration.findById(id, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        if(data === null){
          res.json({name: 'Failed', message: 'This id doesn\'t exist'});
        }
        else {
          res.json(data);
        }
      }
    });
  }

  exports.deleteConfiguration = (id, res) => {
    Configuration.findByIdAndRemove(id, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        if(data === null){
          res.json({name: 'Failed', message: 'This id doesn\'t exist'});
        }
        else {
          res.json({name: 'Success', message: 'Configuration successfully deleted', configuration: data});
        }
      }
    });
  }
