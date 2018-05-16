var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
  type: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  date: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  author: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  configuration: [{
    name: { type: String, lowercase: true, trim: true },
    value: { type: Schema.Types.Mixed, lowercase: true, trim: true }
  }],
  created: {
    type: Date,
    default: Date.Now,
    required: true
  },
  lastModification: {
    type: Date,
    default: Date.Now,
    required: true
  },
  archive: {
    type: Boolean,
    required: false
  }

});

module.exports = mongoose.model('Test', TestSchema);
