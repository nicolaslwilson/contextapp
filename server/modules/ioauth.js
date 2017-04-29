var http;
var memStore;
var io;
var passportSocketIo = require("passport.socketio");
var cookieParser = require('cookie-parser');

var User = require('../models/user.js');
var Conversation = require('../models/conversation.js');
var Message = require('../models/message.js');

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(new Error());
}

function init(_http, _memStore) {
  http = _http;
  memStore = _memStore;
  //do something
  io = require('socket.io')(http);

  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       // the same middleware you registrer in express
    key:          'user',       // the name of the cookie where express/connect stores its session_id
    secret:       'secret',    // the session_secret to parse the cookie
    store:        memStore,        // we NEED to use a sessionstore. no memorystore please
    success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
    fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
  }));

  io.sockets.on ('connection', function(socket) {
      console.log("A USER LOGGED IN WITH ID: ", socket.request.user._id);
      socket.on('conversation', function(conversation){
        console.log('Joined conversation', conversation);
        socket.join(conversation);
        Message.find({conversationId: conversation})
        .populate({path: 'author', select: 'username'})
        .exec( function (err, messages) {
          Conversation.findOne({_id: conversation}, function (err, conversationData) {
            console.log({conversationData, messages});
            io.sockets.in(conversation).emit('conversationData', {conversationData, messages});
          });
        });
      });


      socket.on('message', function(message) {
        console.log('message', message);
        var messageToSave = new Message({
          conversationId: message.conversationId,
          body: message.body,
          author: socket.request.user._id
        });
        messageToSave.save(function (err, savedMessage) {
          Message.populate(savedMessage, {path: 'author', select: 'username'}, function(err, populatedMessage) {
            io.sockets.in(message.conversationId).emit('message', savedMessage);
          });
        });

      });
  });

}

module.exports = init;
