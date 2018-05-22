var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSubjectSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true,
  },
  configuration: [{
    name: { type: String, lowercase: true, trim: true },
    options: [{ type: String, uppercase: true, trim: true }]
  }],
  author: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  created: {
    type: Date,
    default: Date.Now,
    required: true
  },
});

var TestSubject = mongoose.model('TestSubject', TestSubjectSchema);
module.exports = TestSubject;
