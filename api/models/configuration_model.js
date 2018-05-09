var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigurationSchema = new Schema({
  author: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  testSubjectName: {
    type: String,
    unique: false,
    required: false,
    trim: true,
    uppercase: true
  },
  date: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  configuration: [{
    name: { type: String, lowercase: true, trim: true },
    value: { type: String, lowercase: true, trim: true }
  }],
  created: {
    type: Date,
    default: Date.Now,
    required: true
  },
});

var Configuration = mongoose.model('Configuration', ConfigurationSchema);
module.exports = Configuration;
