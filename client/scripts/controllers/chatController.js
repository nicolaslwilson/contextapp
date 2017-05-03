myApp.controller('ChatController', ['$scope', '$http', '$location', '$mdSidenav', 'UserService', 'SocketService', function($scope, $http, $location, $mdSidenav, UserService, SocketService) {
  var chat = this;
  chat.user = UserService.userObject;
  chat.socket = SocketService;
  chat.addContact = UserService.addContact;
  chat.acceptContact = UserService.acceptContact;
  chat.removeContact = UserService.removeContact;


  chat.createConversation = createConversation;
  chat.selectedFilter = -1;
  chat.inputUserName = "";
  chat.logout = UserService.logout;

  chat.selectedUsers = [];
  chat.transformChip = transformChip;
  chat.selectedItem = null;
  chat.searchText = null;
  chat.querySearch = querySearch;
  chat.createNewConversationFormOpen = false;

  chat.hashCode = hashCode;
  chat.intToRGB = intToRGB;

  function transformChip(chip) {
    // If it is an object, it's already a known chip
    if (angular.isObject(chip)) {
      return chip;
    }

    // Otherwise, create a new one
    return { name: chip, type: 'new' };
  }

  function querySearch (query) {

      var results = query ? chat.user.data.contactList.filter(createFilterFor(query)) : [];
      console.log(chat.user.data.contactList, query, results);
      return results;
    }

  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(contact) {
      var lowercaseUsername =
      angular.lowercase(contact.username);
      console.log(lowercaseUsername);
      return (lowercaseUsername.indexOf(lowercaseQuery) === 0);
    };

  }

  function createConversation (conversationParticipants) {
    if (chat.selectedUsers.length > 0) {
      var conversationParticipantIds = conversationParticipants.map(function (user) {
        return user._id;
      });

      chat.selectedUsers = [];
      chat.createNewConversationFormOpen = false;

      UserService.createConversation(conversationParticipantIds);
    }
    else {
      alert("Input at least one contact to create a new conversation");
    }
  }

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

  function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

}]);
