myApp.controller('ChatController', ['$scope', '$http', '$location', 'UserService', function($scope, $http, $location, UserService, ChatService) {
  var chat = this;
  chat.socket = io();
  chat.user = UserService.userObject;
  chat.messages = [];
  chat.conversationTags = [];
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;
  chat.createConversation = UserService.createConversation;
  chat.inputUserName = "";
  chat.logout = UserService.logout;

  chat.joinConversation = function (conversationId) {
    console.log('joining', conversationId);
    chat.currentConversation = conversationId;
    chat.socket.emit('conversation', conversationId);
  };

  chat.inputTag = function (messageId) {
    var tag = prompt("Please input a tag");
    chat.addTag(messageId, tag);
  };

  chat.addTag = function (messageId, tag) {
    $http.put('/user/message/tag', {_id: messageId, tag: tag}).then(function (response) {
      $scope.$apply(chat.conversationTags = response.updatedConversation.tags);
    });
  };



  chat.socket.on('connect', function () {
    console.log('Connected');
  });

  chat.socket.on('conversationData', function(conversationData){
    console.log('conversationData', conversationData);
    for (var i = 0; i < conversationData.messages.length; i++) {
      $scope.$apply(chat.messages.push(conversationData.messages[i]));
    }
      $scope.$apply(chat.conversationTags = conversationData.conversationData.tags);
  });
  chat.socket.on('message', function(message){
    console.log(message);
    $scope.$apply(chat.messages.push(message));
  });
}]);
