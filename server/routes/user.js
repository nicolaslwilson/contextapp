var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

var User = require('../models/user.js');
var Conversation = require('../models/conversation.js');
var Message = require('../models/message.js');

router.post('/add', isLoggedIn, function (req, res) {
  var contact;
  //Verify contact request is for an extant user and not already in contactList.
  User.findOne({username: req.body.username, 'contactList.contact': {$ne: req.user._id}}, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        contact = user;
        //Push request to contact's contactList
        User.findOneAndUpdate({_id: contact._id}, { $addToSet: {contactList: {contact: req.user._id, status: 'request'}}}, {new: true}, function (err, contact) {
          if (err) {
            console.log(err);
          }
          else {
            //Push pending contact to user's contactList
            User.findOneAndUpdate({_id: req.user._id},{ $addToSet: {contactList: {contact: contact._id}}}, {new: true})
            .populate({path: 'contactList.contact', select: 'username'})
            .exec(function (err, user) {
              res.send({success: true, contactList: user.contactList});
            });
          }
        });
      } else {
        res.send({success: false});
      }
    }
  });
});

// Handles Ajax request for user information if user is authenticated
router.get('/', isLoggedIn, function(req, res) {
  User.findOne({_id: req.user._id}).populate({path: 'contactList.contact', select: 'username'}).exec(
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        Conversation.find({participants: req.user._id}, function (err, conversations) {
          res.send({
            username: user.username,
            contactList: user.contactList,
            conversationList: conversations,
            messages: []
          });
        });

      }
    }
  );
});

router.put('/accept', isLoggedIn, function (req, res) {
  var contactUsername = req.body.username;
  User.findOne({username: contactUsername}, function(err, contact){
    var contactIndex = findContactInList(req.user._id, contact.contactList);
    if (contactIndex > -1) {
      contact.contactList[contactIndex].status = 'Confirmed';
      contact.save();
    }
    User.findOne({_id: req.user._id}, function(err, user){
      var userIndex = findContactInList(contact._id, user.contactList);
      if (userIndex > -1) {
        user.contactList[contactIndex].status = 'Confirmed';
        user.save(function (err, savedUser) {
          if (err) {
            console.log(err);
          } else {
              User.findOne({_id: req.user._id})
              .populate({path: 'contactList.contact', select: 'username'})
              .exec(function (err, user) {
                res.send({success: true, contactList: user.contactList});
              });
          }
        });
      }
    });
  });
});

router.delete('/remove/:username', isLoggedIn, function (req, res) {
  var contactUsername = req.params.username;
  User.findOne({username: contactUsername}, function(err, contact){
    var contactIndex = findContactInList(req.user._id, contact.contactList);
    if (contactIndex > -1) {
      contact.contactList.splice(contactIndex, 1);
      contact.save();
    }
    User.findOne({_id: req.user._id}, function(err, user){
      var userIndex = findContactInList(contact._id, user.contactList);
      if (userIndex > -1) {
        user.contactList.splice(userIndex, 1);
        user.save(function (err, savedUser) {
          if (err) {
            console.log(err);
          } else {
              User.findOne({_id: req.user._id})
              .populate({path: 'contactList.contact', select: 'username'})
              .exec(function (err, user) {
                res.send({success: true, contactList: user.contactList});
              });
          }
        });
      }
    });
  });
});

router.post('/conversation/add', isLoggedIn, function(req, res) {
  var contactUsername = req.body.username;
  User.findOne({username: req.body.username}, function (err, contact) {
    if (err) {
      console.log(err);
    }
    if (contact) {
      var conversation = new Conversation({
        participants: [req.user._id]
      });
      conversation.participants.push(contact._id);
      conversation.save(function (err, conversation) {
        if (err) {
          console.log(err);
          res.sendStatus(404);
        }
        Conversation.find({participants: req.user._id}, function (err, conversations) {
          res.send({success: true, conversationList: conversations});
        });
      });
    }
    else {
      res.send({success: false, message: 'Failed to Add User to Conversation'});
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

function findContactInList (id, contactList) {
  var index = -1;
  var contactID;
  for (var i = 0; i < contactList.length; i++) {
    contactID = contactList[i].contact;
    if (contactID.equals(id)) {
      index = i;
      return index;
    }
  }
 return index;
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    return res.redirect('/');
}

module.exports = router;
