require('dotenv').config();
const express = require('express');        
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const seedDB = require('./seeds');  //file to reset and baseline populate database 
let User = require('./models/user');
const methodOverride = require('method-override');
//==============MIDDLEWARE==================


const   indexRoutes         = require('./routes/index'),
        campgroundRoutes    = require('./routes/campgrounds'),
        commentRoutes       = require('./routes/comments');

mongoose.connect('mongodb://localhost/yelpcamp');
const app = express();
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public')); //__dirname is root from which app.js is running
app.use(flash());
// put mock data into database
// seedDB();


// Passport Configuration
app.use(require('express-session')({
    secret: 'Still I have nothing to hide',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//========MIDDLEWARE===========
//Middleware that works on every route and sets variable res.locals.currentUser to be available by all views
app.use((req,res,next) => {                         
    res.locals.currentUser = req.user;          // req.user is set by passport authorization
    res.locals.error = req.flash('error');    // pushes message through to all routes
    res.locals.success = req.flash('success');
    next();                                     // move to res argument in route info
})

// importing routes 
app.use(indexRoutes);
//prepend path to all campgroundRoutes
app.use('/campgrounds', campgroundRoutes);  
app.use('/campgrounds/:id/comments',commentRoutes);

app.listen(3000, function(){
    console.log('YelpCamp started on port 3000')
}); 
