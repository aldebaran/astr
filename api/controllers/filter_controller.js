var mongoose = require('mongoose'),
  Filter = mongoose.model('Filter');

  exports.getAllFilters = (req, res) => {
    Filter.find({}, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json(data);
      }
    });
  };

  exports.addFilter = (req, res) => {
    var newFilter = new Filter(req.body);
    newFilter.created = Date.now();
    newFilter.save((err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        res.json({name: 'Success', message: 'Filter successfully added', filter: data});
      }
    });
  }

  exports.getFilter = (id, res) => {
    Filter.findById(id, (err, data) => {
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

  exports.deleteFilter = (id, res) => {
    Filter.findByIdAndRemove(id, (err, data) => {
      if (err) {
        res.send(err);
      }
      else {
        if(data === null){
          res.json({name: 'Failed', message: 'This id doesn\'t exist'});
        }
        else {
          res.json({name: 'Success', message: 'Filter successfully deleted', filter: data});
        }
      }
    });
  }
