myApp.controller('ChatController', ['$scope', '$http', '$location', '$mdSidenav', 'UserService', 'SocketService', function($scope, $http, $location, $mdSidenav, UserService, SocketService) {
  var chat = this;
  chat.user = UserService.userObject;
  chat.socket = SocketService;
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;
  chat.createConversation = UserService.createConversation;
  chat.selectedFilter = -1;
  chat.inputUserName = "";
  chat.logout = UserService.logout;

  chat.joinConversation = function (conversationId) {
    console.log('joining', conversationId);
    chat.setActiveFilter(-1);
    chat.socket.conversation.currentConversation = conversationId;
    chat.socket.conversation.messages.length = 0;
    chat.user.socket.emit('joinConversation', conversationId);
    console.log(chat.socket);
  };

  chat.inputTag = function (messageId) {
    var tag = prompt("Please input a tag");
    chat.addTag(messageId, tag);
  };

  chat.addTag = function (messageId, tag) {
    $http.put('/user/message/tag', {_id: messageId, tag: tag}).then(function (response) {
      console.log(response);
      chat.socket.conversation.tags = response.data;
    });
  };

  chat.filterConversation = function (tag) {
    console.log(chat.socket);
    $http.get('/user/conversation/' + chat.socket.conversation.currentConversation + '/'+ tag).then(function (response) {
      chat.socket.conversation.messages = response.data;
    });
  };

  chat.removeFilter = function () {
    chat.setActiveFilter(-1);
    $http.get('/user/conversation/' + chat.socket.conversation.currentConversation).then(function (response) {
      chat.socket.conversation.messages = response.data;
    });

  };

  chat.setActiveFilter = function (index) {
    chat.selectedFilter = index;
    console.log(chat.selectedFilter);
  };

  chat.toggleContacts = function () {
    $mdSidenav('contactsPane').toggle();
  };

}]);
