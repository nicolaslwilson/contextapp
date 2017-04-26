myApp.factory('UserService', ['$http', '$location', function($http, $location){
  console.log('User Service Loaded');

  var userObject = {};

  return {
    userObject : userObject,

    getuser : function(){
      $http.get('/user').then(function(response) {
          if(response.data.username) {
              // user has a curret session on the server
              userObject.username = response.data.username;
              console.log('User Data: ', response.data);
          } else {
              // user has no session, bounce them back to the login page
              $location.path("/home");
          }
      });
    },

    addContact: function (username) {
      console.log(username);
      $http.post('/user/add', {username: username}).then(function(response){
        console.log(response);
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
