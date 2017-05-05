myApp.factory('UserService', ['$http', '$location', 'SocketService', function($http, $location, SocketService){
  console.log('User Service Loaded');
  //Declare an empty userObject. This will store information about the currently logged in User.
  var userObject = {};

  return {
    //Allow controllers to access the userObject.
    userObject : userObject,

    //Get data related to the current user.
    getuser : function(){
      $http.get('/user').then(function(response) {
          if(response.data.username) {
              //User has a current session on the server
              userObject.data = response.data;
              //Once we know the user is logged in we can open a socket.io connection
              userObject.socket = SocketService.openChatSocket(response.data.lastConversation);
              console.log('User Data: ', response.data, userObject);
          } else {
              //If user has no session, bounce them back to the login page
              $location.path("/home");
          }
      });
    },
    //Sends a contact request taking in a username
    addContact: function (username) {
      return $http.post('/user/add', {username: username}).then(
        //Successful response callback
        function(response){
          console.log('addContact response', response);
          if (response ) {
            userObject.data = response.data;
            return true;
          }
        },
        //Error response callback
        function (error) {
          if (error) {
            console.log(error);
            return false;
          }
        });
    },
    //Removes a contact
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
    //Accepts a contact request
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
    //Create a new conversation
    createConversation: function (conversationParticipantIds) {
      $http.post('/user/conversation/add', { conversationParticipantIds}).then(function(response){
        console.log('addContact response', response);
        if (response.status !== 200) {
          alert("Request Failed");
        } else {
          userObject.data = response.data;
        }

      });
    },
    //Log the user out
    logout : function() {
        $http.get('/user/logout').then(function(response) {
          //Log the user out.
          userObject = {};
          console.log('logged out');
          $location.path("/home");
        });
    }
  };
}]);
