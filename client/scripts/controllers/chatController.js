myApp.controller('ChatController', ['$scope', '$http', '$location', 'UserService', function($scope, $http, $location, UserService) {
  var chat = this;

  chat.user = UserService;
  console.log(UserService);
  chat.logout = UserService.logout;
  chat.inputUserName = "test";
  chat.addContact = UserService.addContact;
  var socket = io();
  $scope.click = function () {
    socket.emit('message', 'hello world!');
  };
}]);
