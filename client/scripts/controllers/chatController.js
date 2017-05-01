myApp.controller('ChatController', ['$scope', '$http', '$location', '$mdSidenav', 'UserService', 'SocketService', function($scope, $http, $location, $mdSidenav, UserService, SocketService) {
  var chat = this;
  chat.socket = UserService.socket;
  chat.user = UserService.userObject;
  chat.messages = SocketService.messages;
  chat.conversationTags = [];
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;
  chat.createConversation = UserService.createConversation;
  chat.selectedFilter = -1;
  chat.inputUserName = "";
  chat.logout = UserService.logout;

  chat.joinConversation = function (conversationId) {
    console.log('joining', conversationId);
    chat.currentConversation = conversationId;
    chat.messages = [];
    chat.socket.emit('joinConversation', conversationId);
  };

  chat.inputTag = function (messageId) {
    var tag = prompt("Please input a tag");
    chat.addTag(messageId, tag);
  };

  chat.addTag = function (messageId, tag) {
    $http.put('/user/message/tag', {_id: messageId, tag: tag}).then(function (response) {
      console.log(response);
      chat.conversationTags = response.data;
    });
  };

  chat.filterConversation = function (tag) {
    $http.get('/user/conversation/' + chat.currentConversation + '/'+ tag).then(function (response) {
      chat.messages = response.data;
    });
  };

  chat.removeFilter = function () {
    chat.setActiveFilter(-1);
    $http.get('/user/conversation/' + chat.currentConversation).then(function (response) {
      chat.messages = response.data;
    });

  };

  chat.setActiveFilter = function (index) {
    chat.selectedFilter = index;
    console.log(chat.selectedFilter);
  };

  chat.toggleContacts = function () {
    $mdSidenav('contactsPane').toggle();
  };


  chat.socket.on('connect', function () {
    console.log('Connected');
    chat.currentConversation = UserService.userObject.data.lastConversation;
  });

  chat.socket.on('conversationData', function(conversationData){
    console.log('conversationData', conversationData);

    for (var i = 0; i < conversationData.messages.length; i++) {
      $scope.$apply(chat.messages.push(conversationData.messages[i]));
    }
      $scope.$apply(chat.conversationTags = conversationData.tags);
  });
  chat.socket.on('message', function(message){
    console.log(message);
    $scope.$apply(chat.messages.push(message));
  });
}]);
