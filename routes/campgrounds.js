require('dotenv').config();
const express = require('express');
//define variable router to pass routes to app.js via module.exports
const router = express.Router();
//require models to use in file
const Campground = require('../models/campground');
const middleware = require('../middleware'); 
const NodeGeocoder = require('node-geocoder');  
let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.AIzaSyBIqWdovippewbWzy_9LBUeagpF7UvXIpI,
    formatter: null
};
let geocoder = NodeGeocoder(options);

const flash = require('connect-flash');
router.use(flash());

//=========CAMPGROUND ROUTES=========================
//index route
router.get('/', (req, res) =>
    Campground.find({}, (err, allCamps) =>
        (err) 
        ?   console.log(err)
        // we pass req.user which contains loggedin user name
        :   res.render('campgrounds/index', {campgrounds: allCamps, page: 'campgrounds'})          
    )    
);

//NEW ROUTE
router.get('/new', middleware.isLoggedIn, (req, res) =>
    res.render('campgrounds/new')
);  


//CREATE ROUTE
router.post('/', middleware.isLoggedIn, (req, res) => {
    let newEntry = req.body.campground;
    newEntry.price = parseFloat(newEntry.price);
    newEntry.author = {id: req.user._id, username: req.user.username};
    console.log(req.body.campground.location);
    geocoder.geocode(req.body.campground.location, (err, data) => {
        if (err) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        newEntry.lat = data[0].latitude;
        newEntry.lng = data[0].longitude;
        newEntry.location = data[0].formattedAdress;

        Campground.create(newEntry, (err, campground) => 
            (err)
            ?   console.log(err)
            :   (
                req.flash('success', 'New Campground '+ campground.name + 'created.'),
                res.redirect('/campgrounds')
            )
        );    
    });
});

//SHOW ROUTE
router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, foundCampGround) =>
        (err) 
        ?   (
            req.flash('error', 'Campground not found'),
            res.redirect('/campgrounds')
            )
        :   res.render('campgrounds/show', {campground: foundCampGround})
    );
});

// Edit Campground Route
router.get('/:id/edit', middleware.authCampground, (req, res) =>
    Campground.findById(req.params.id, (err, foundCampground) =>
        (err)
        ?   res.redirect('/campgrounds')
        :   res.render('campgrounds/edit', {campground: foundCampground})
    )   
)

// Update Campground Route
router.put('/:id', middleware.authCampground, (req, res) => {
    let editedCampground = req.body.campground;
    editedCampground.price = parseFloat(editedCampground.price);
    geocoder.geocode(req.body.campground.location, (err, data) => {
        if (err || data.status === 'ZERO_RESULTS') {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        console.log(data);
        editedCampground.lat = data[0].latitude;
        editedCampground.lng = data[0].longitude;
        editedCampground.location = data[0].formattedAdress;
        Campground.findByIdAndUpdate(req.params.id, editedCampground, (err, campground) =>
            (err)
            ?   (
                req.flash('error',err.message),
                res.redirect('/campgrounds')
                )
            :   (
                req.flash('success', campground.name + ' has been edited'),
                res.redirect('/campgrounds/' + req.params.id)
                )
        ); 
    }); 
});

// Destroy Campground Route
router.delete('/:id', middleware.authCampground, (req, res) =>
    Campground.findByIdAndRemove(req.params.id, (err, campground) =>
        (err)
        ?   res.redirect('/campgrounds')
        :   (
            req.flash('error', 'Campground ' + campground.name + ' deleted'),
            res.redirect('/campgrounds')
            )
    )
)

module.exports = router;