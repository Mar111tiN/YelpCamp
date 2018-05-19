const express = require('express');
//define variable router to pass routes to app.js via module.exports
const router = express.Router();
const passport = require('passport');
let User = require('../models/user');
const flash = require('connect-flash');
router.use(flash());

//-------------HOME route-------------
router.get('/', (req, res) => res.render('landing'));

//===============AUTH ROUTES========

//show register form
router.get('/register', (req, res) => res.render('register', {page: 'register'}));

//--------SIGN UP post
router.post('/register', (req,res) => {
    let newUser = new User({username: req.body.username});
    eval(require('locus'));
    if(req.body.adminCode == 'secretcode')
    User.register(newUser, req.body.password, (err, user) =>
        (err) 
        ?   (
            req.flash('error',err.message),
            res.redirect('register')
            )
        :   passport.authenticate('local')(req, res, () => {
                req.flash('success', 'You are now registered as ' + user.username);
                res.redirect('/campgrounds');
            })
    );
});

// SHOW LOGIN FORM 
router.get('/login', (req, res) => res.render('login', {page: 'login'}));

// LOGIN POST 
router.post('/login', passport.authenticate('local', {     // this is a middleware, a function run efore the routing
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function(req, res) {

});

// LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('error', 'Logged you Out!')
    res.redirect('/campgrounds');
});


module.exports = router;