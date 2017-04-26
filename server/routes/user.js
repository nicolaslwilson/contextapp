var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

var User = require('../models/user.js');
var Conversation = require('../models/conversation.js');
var Message = require('../models/message.js');


router.post('/add', isLoggedIn, function (req, res) {
  console.log(req.body);
  User.findOneAndUpdate({username: req.user.username}, { $addToSet: {contactList: req.body.username}}, function (err, user) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(user);
      res.send(user.contactList);
    }
  });


});

// Handles Ajax request for user information if user is authenticated
router.get('/', isLoggedIn, function(req, res) {
  res.send(req.user);
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
    console.log("in isLoggedIn");
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log("is Logged In");
        return next();
    }
    // if they aren't redirect them to the home page
    console.log("is not logged in");
    res.redirect('/');
}

module.exports = router;
