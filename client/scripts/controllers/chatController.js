myApp.controller('ChatController', ['$scope', '$http', '$location', 'UserService', function($scope, $http, $location, UserService, ChatService) {
  var chat = this;
  chat.socket = io();
  chat.user = UserService.userObject;
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;
  chat.logout = UserService.logout;
  chat.inputUserName = "test";

  chat.socket.on('connect', function () {
    console.log('Connected and joining conversation');
    chat.socket.emit('conversation', 'general');
  });

  chat.socket.on('message', function(message){
    $scope.$apply(chat.user.data.messages.push(message));
  });
}]);
