myApp.factory('SocketService', ['$http', '$location', '$rootScope', function($http, $location, $scope){
  console.log('Socket Service Loaded');
  var   conversation = {
        messages: [],
        tags: []
      };
  var openChatSocket = function (lastConversation) {
    var socket = io();
    console.log("lastConversation", lastConversation);
    socket.on('connect', function () {
      console.log('Connected');
      conversation.currentConversation = lastConversation;
      console.log(conversation.currentConversation);
    });

    socket.on('conversationData', function(conversationData){
      console.log('conversationData', conversationData);
      conversation.messages.length = 0;
      $scope.$apply([].push.apply(conversation.messages, conversationData.messages));
      conversation.tags.length = 0;
      $scope.$apply([].push.apply(conversation.tags, conversationData.tags));
    });

    socket.on('message', function(message){
      console.log(message);
      $scope.$apply(conversation.messages.push(message));
    });

    return socket;
  };

  return {
    conversation,
    openChatSocket
  };
}]);
