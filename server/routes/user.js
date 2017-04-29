var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

var User = require('../models/user.js');
var Conversation = require('../models/conversation.js');
var Message = require('../models/message.js');

router.post('/add', isLoggedIn, function (req, res) {
  console.log('add', req.body);
  var contact = req.body;
  var initiator = req.user;
  //Verify contact is not self
  if (contact.username == initiator.username) {
    console.log('Can\'t add self as contact');
    res.sendStatus(500);
  }
  //Push request to user
  User.findOneAndUpdate(
    //Find user with username, verify user not already a contact and no request already pending
    {username: contact.username, contactList: {$ne: initiator._id}, requestList: {$ne: initiator._id}},
    {$addToSet: {requestList: initiator._id}},
    function (err, contactFromQuery) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else if (contactFromQuery) {
        assembleUserDataAndSendResponse(initiator._id, res);
      }
      else {
        res.sendStatus(500);
      }
    });
});

// Handles Ajax request for user information if user is authenticated
router.get('/', isLoggedIn, function(req, res) {
  var user = req.user;
  assembleUserDataAndSendResponse(user._id, res);
});

router.put('/accept', isLoggedIn, function (req, res) {
  console.log('PUT /accept', req.body, req.user);
  var user = req.user;
  var contact = req.body;
  User.findOneAndUpdate(
    //Find current user
    {_id: user._id},
    //Add contact to contactList
    {
      $pull: {requestList: contact._id},
      $addToSet: {contactList: contact._id}
    },
    //Update contact
    function (err, updatedUser) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      User.findOneAndUpdate(
        {_id: contact._id},
        //Add contact to contactList
        {$addToSet: {contactList: user._id}},
        //Update contact
        function (err, updatedContact) {
          console.log("*******Updated*******\nUser-----\n", user, "\nContact-----\n", contact);
          assembleUserDataAndSendResponse(user._id, res);
        }
      );
    }
  );
});

router.put('/message/tag', isLoggedIn, function (req, res) {
  var tag = req.body;
  Message.findOneAndUpdate(
    //Find current user
    {_id: tag._id},
    //Add contact to contactList
    {
      tag: tag.tag
    },
    {
      new: true
    },
    //Update contact
    function (err, updatedMessage) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      Message.distinct('tag', {conversationId: updatedMessage.conversationId}, function (err, tags) {
        console.log(tags);
        res.send(tags)
      });
    }
  );
});

router.delete('/remove/:id', isLoggedIn, function (req, res) {
  var user = req.user;
  var contactId = req.params.id;
  User.findOneAndUpdate(
    {_id: user._id},
    {$pull: {requestList: contactId}},
    function(err, contact){
      assembleUserDataAndSendResponse(user._id, res);
  });
});

router.get('/conversation/:conversationId/:tag', isLoggedIn, function (req, res) {
  Message.find({conversationId: req.params.conversationId, tag: req.params.tag})
  .populate({path: 'author', select: 'username'})
  .exec( function (err, messages) {
    if (err) {
      res.sendStatus(500);
    }
    res.send(messages);
  });
});

router.post('/conversation/add', isLoggedIn, function(req, res) {
  var user = req.user;
  var contact = req.body;
  //Make sure input contact is an extant user
  User.findOne({username: contact.username}, function (err, contact) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    //If user exists, start a new conversation with that user
    if (contact) {
      var conversation = new Conversation({
        participants: [user._id, contact._id]
      });
      //Save conversation and send updated user data to client
      conversation.save(function (err, conversation) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        Conversation.find({participants: user._id}, function (err, conversations) {
          assembleUserDataAndSendResponse(user._id, res);
        });
      });
    }
    else {
      console.log('No contact');
      res.sendStatus(500);
    }
  });
});

// clear all server session information about this user
router.get('/logout', function(req, res) {
  // Use passport's built-in method to log out the user
  console.log('Logged out');
  req.logOut();
  res.sendStatus(200);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    return res.redirect('/');
}

function assembleUserDataAndSendResponse(uid, res) {
  var userObject = {};
  User.findOne({_id: uid})
  .populate({path: 'requestList contactList', select: 'username'})
  .exec(function (err, user) {
    if (err) {
      res.sendStatus(500);
    }
    Conversation.find({participants: uid})
    .populate({path: 'participants', select: 'username'})
    .exec(function (err, conversations) {
      if (err) {
        res.sendStatus(500);
      }
      userObject._id = user._id;
      userObject.username = user.username;
      userObject.requestList = user.requestList;
      userObject.contactList = user.contactList;
      userObject.conversationList = conversations;
      console.log(userObject);
      res.send(userObject);
    });
  });
}

module.exports = router;
