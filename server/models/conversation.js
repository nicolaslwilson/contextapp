var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User'}],
  tags: Array
});

module.exports = mongoose.model('Conversation', ConversationSchema);
