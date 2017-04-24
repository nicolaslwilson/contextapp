var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
  participants: Array,
  messages: Array,
  tags: Array
});

module.exports = mongoose.model('Conversation', ConversationSchema);
