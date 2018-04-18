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
  configuration: {
    type: [String],
    unique: false,
    required: true
  },
  author: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
});

var TestSubject = mongoose.model('TestSubject', TestSubjectSchema);
module.exports = TestSubject;
