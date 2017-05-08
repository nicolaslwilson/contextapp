myApp.controller('ChatController', ['$scope', '$http', '$location', '$mdSidenav', '$mdDialog', '$mdToast', 'UserService', 'SocketService', function($scope, $http, $location, $mdSidenav, $mdDialog, $mdToast, UserService, SocketService) {
  var chat = this;
  chat.user = UserService.userObject;
  chat.socket = SocketService;
  chat.addContact = function (username) {
    UserService.addContact(username).then(function (response) {
      console.log(response);
      if (response) {
        showFriendRequestSuccessToast();
        chat.inputUserName = "";
      }
      else {
        showFriendRequestFailToast();
      }
    });
  };
  chat.acceptContact = function (id) {
    UserService.acceptContact(id).then(function(response) {
      console.log(response);
      if (response) {
        showToast('Friend Request Accepted');
      }
      else {
        showToast('Error');
      }
    });
  };
  chat.removeContact = function (id) {
    UserService.removeContact(id).then(function(response) {
      console.log(response);
      if (response) {
        showToast('Friend Request Denied');
      }
      else {
        showToast('Error');
      }
    });
  };

  chat.showDialog = showDialog;

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


  chat.tagDialogInput = "Hey";
  chat.selectedTag = null;
  chat.searchTagText = null;
  chat.querySearchTags = querySearchTags;


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

  function querySearchTags (query) {

      var results = query ? chat.socket.conversation.tags.filter(createFilterForTag(query)) : [];
      console.log(chat.socket.conversation.tags, query, results);
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

  function createFilterForTag(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(tag) {
      var lowercaseTag =
      angular.lowercase(tag);
      console.log(lowercaseTag);
      return (lowercaseTag.indexOf(lowercaseQuery) === 0);
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

  function showDialog($event, message, tags) {
       var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: $event,
         template:
          `<md-dialog aria-label="List dialog" layout="column" flex="30">
            <md-dialog-content flex>'
           {{alert}}
           <form
             class="add-tag-form"
             ng-submit="closeDialog(tag)"
             layout="column"
             flex>
             <md-input-container>
              <label>Input a tag or select one from below</label>
              <input type="text" ng-model="tag">
             </md-input-container>
           </form>
           <div
             class="tag-cloud"
             layout="row"
             ng-click="chat.removeFilter()"
             layout-wrap>
               <md-button
                 ng-style="{color: ('#' + chat.intToRGB(chat.hashCode(tag)))}"
                 md-no-ink="true" class="md-raised tag"
                 ng-repeat="tag in tags"
                 ng-click="closeDialog(tag)">
                   {{tag}}
               </md-button>
           </div>
             </md-dialog-content>
             <md-dialog-actions>
              <md-button ng-click="closeDialog(tag)" class="md-primary">
                 Add Tag
              </md-button>
              <md-button ng-click="cancel()" class="md-primary">
                 Cancel
              </md-button>
             </md-dialog-actions>
           </md-dialog>`,
         locals: {
           messageObject: message,
           tags: tags
         },
         scope: $scope,
         preserveScope: true,
         controller: DialogController
      });
      function DialogController($scope, $mdDialog, messageObject, tags) {
        $scope.alert = '';
        $scope.tag = messageObject.tag;
        $scope.tags = tags;
        $scope.cancel = $mdDialog.hide;
        $scope.closeDialog = function(tag) {
          if (tag) {
            messageObject.tag = tag;
            chat.addTag(messageObject._id, tag);
            $mdDialog.hide();
          } else {
            $scope.alert = "Please input a tag";
          }

        };
      }
    }

    function showToast (text) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(text)
          .hideDelay(3000)
      );
    }

    function showFriendRequestSuccessToast () {
      $mdToast.show(
        $mdToast.simple()
          .textContent('Contact Request Pending')
          .hideDelay(3000)
      );
    }

    function showFriendRequestFailToast () {
      $mdToast.show(
        $mdToast.simple()
          .textContent('Failed To Find Contact')
          .hideDelay(3000)
      );
    }



}]);
