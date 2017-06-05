var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');

// Passport + Session Configuration //
var expressSession = require('express-session');
var passport = require('./strategies/userStrategy');
// Create Session Store
var memStore = new expressSession.MemoryStore();

//Check if there is an environmental variable to use as the session secret
var sessionSecret = process.env.SESSION_SECRET || 'secret';

//Configure the express-session
var session = expressSession({
   secret: sessionSecret,
   store: memStore,
   key: 'user', // this is the name of the req.variable. 'user' is convention, but not required
   resave: 'true',
   saveUninitialized: false,
   cookie: { maxage: 60000, secure: false }
});

//DB Module
var db = require('./modules/db.js');

// Socket module
var socket = require('./modules/ioauth')(http, memStore);

// Route includes
var index = require('./routes/index');
var user = require('./routes/user');
var register = require('./routes/register');

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve back static files
app.use(express.static('./server/public'));

// Passport Session middleware //
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/register', register);
app.use('/user', user);
app.use('/', index);

// App Set //
app.set('port', (process.env.PORT || 5000));

// Listen //
http.listen(app.get("port"), function(){
   console.log("Listening on port: " + app.get("port"));
});
