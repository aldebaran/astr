var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  version: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.Now,
    required: true,
  },
  lastBootUptime: {
    type: Date,
    default: Date.Now,
    required: true,
  },
});

var Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
