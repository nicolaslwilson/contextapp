myApp.factory('UserService', ['$http', '$location', 'SocketService', function($http, $location, SocketService){
  console.log('User Service Loaded');

  var userObject = {};

  return {
    userObject : userObject,

    getuser : function(){
      $http.get('/user').then(function(response) {
          if(response.data.username) {
              // user has a curret session on the server
              userObject.data = response.data;
              userObject.socket = SocketService.openChatSocket(response.data.lastConversation);
              console.log('User Data: ', response.data, userObject);
          } else {
              // user has no session, bounce them back to the login page
              $location.path("/home");
          }
      });
    },
    addContact: function (username) {
      $http.post('/user/add', {username: username}).then(function(response){
        console.log('addContact response', response);
        if (response.status !== 200) {
          alert("Request Failed");
        } else {
          userObject.data = response.data;
        }

      });
    },
    removeContact: function (id) {
      $http.delete('/user/remove/' + id).then(function(response){
        console.log('addContact response', response);
        if (response.status !== 200) {
          alert("Request Failed");
        } else {
          userObject.data = response.data;
        }
      });
    },
    acceptContact: function (id) {
      $http.put('/user/accept', {_id: id}).then(function(response){
        console.log('addContact response', response);
        if (response.status !== 200) {
          alert("Request Failed");
        } else {
          userObject.data = response.data;
        }
      });
    },
    createConversation: function (username) {
      $http.post('/user/conversation/add', {username: username}).then(function(response){
        console.log('addContact response', response);
        if (response.status !== 200) {
          alert("Request Failed");
        } else {
          userObject.data = response.data;
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
