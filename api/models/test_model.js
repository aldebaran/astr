var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
  _id: String,
  type: String
});

module.exports = mongoose.model('Test', TestSchema);
