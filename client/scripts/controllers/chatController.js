myApp.controller('ChatController', ['$scope', '$http', '$location', 'UserService', function($scope, $http, $location, UserService, ChatService) {
  var chat = this;
  chat.socket = io();
  chat.user = UserService.userObject;
  chat.messages = [];
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;
  chat.createConversation = UserService.createConversation;
  chat.joinConversation = function (conversationId) {
    console.log(conversationId);
    chat.currentConversation = conversationId;
    chat.socket.emit('conversation', conversationId);
  };
  chat.logout = UserService.logout;
  chat.inputUserName = "test";

  chat.socket.on('connect', function () {
    console.log('Connected');
  });

  chat.socket.on('message-history', function(messages){
    console.log(messages);
    chat.messages = [];
    for (var i = 0; i < messages.length; i++) {
      $scope.$apply(chat.messages.push(messages[i]));
    }
  });
  chat.socket.on('message', function(message){
    console.log(message);
    $scope.$apply(chat.messages.push(message));
  });
}]);
