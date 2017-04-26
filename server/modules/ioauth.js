var http;
var memStore;
var io;
var passportSocketIo = require("passport.socketio");
var cookieParser = require('cookie-parser');

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

  io.on ('connection', function(socket) {
      console.log("A USER LOGGED IN WITH ID: ", socket.request.user);
      socket.on('message', function(msg) {
        console.log('Got message from client: ' + msg);
      });
  });

}

module.exports = init;
