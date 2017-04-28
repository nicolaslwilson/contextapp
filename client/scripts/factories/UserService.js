myApp.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  var userObject = {};

  return {
    userObject : userObject,

    getuser : function(){
      $http.get('/user').then(function(response) {
          if(response.data.username) {
              // user has a curret session on the server
              userObject.data = response.data;
              console.log('User Data: ', response.data);
          } else {
              // user has no session, bounce them back to the login page
              $location.path("/home");
          }
      });
    },
    addContact: function (username) {
      $http.post('/user/add', {username: username}).then(function(response){
        console.log('addContact response', response);
        if (response.data.success !== true) {
          alert("Request Failed");
        } else {
          userObject.data.contactList = response.data.contactList;
        }

      });
    },
    removeContact: function (username) {
      $http.delete('/user/remove/' + username).then(function(response){
        console.log('addContact response', response);
        if (response.data.success !== true) {
          alert("Request Failed");
        } else {
          userObject.data.contactList = response.data.contactList;
        }
      });
    },
    acceptContact: function (username) {
      $http.put('/user/accept', {username: username}).then(function(response){
        console.log('addContact response', response);
        if (response.data.success !== true) {
          alert("Request Failed");
        } else {
          userObject.data.contactList = response.data.contactList;
        }
      });
    },
    createConversation: function (username) {
      $http.post('/user/conversation/add', {username: username}).then(function(response){
        console.log('addContact response', response);
        if (response.data.success !== true) {
          alert("Request Failed");
        } else {
          userObject.data.conversationList = response.data.conversationList;
        }

      });
    },
    logout : function() {
        $http.get('/user/logout').then(function(response) {
          console.log('logged out');
          $location.path("/home");
        });
    }
  };
}]);
