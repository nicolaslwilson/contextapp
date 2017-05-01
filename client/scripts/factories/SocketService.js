myApp.factory('SocketService', ['$http', '$location', function($http, $location){
  console.log('Socket Service Loaded');
  let messages = [];
  let openChatSocket = function () {
    let socket = io();

    chat.socket.on('connect', function () {
      console.log('Connected');
      chat.currentConversation = UserService.userObject.data.lastConversation;
    });
  };



  return {
    messages,
    openChatSocket
  };
}]);
