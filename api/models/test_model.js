var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
  //type: String
}, { strict: false }); //false because we want a flexible schema

module.exports = mongoose.model('Test', TestSchema);
