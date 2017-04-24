var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  author: String,
  text: String,
  tag: String,
  timestamp: Date
});

module.exports = mongoose.model('Message', MessageSchema);
