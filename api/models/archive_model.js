var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArchiveSchema = new Schema({
  category: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    unique: false,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  descriptors: [{
    name: {type: String, lowercase: true, trim: true},
    value: {type: String, uppercase: true, trim: true},
  }],
  comments: {
    type: String,
    unique: false,
    required: false,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.Now,
    required: true,
  },
  lastModification: {
    type: Date,
    default: Date.Now,
    required: true,
  },
  isZipPresent: {
    type: Boolean,
    required: false,
  },
  isDownloadable: {
    type: Boolean,
    required: false,
    default: false,
  },
  archiveCategoryId: {
    type: String,
    unique: false,
    required: true,
  },
});

module.exports = mongoose.model('Archive', ArchiveSchema);
