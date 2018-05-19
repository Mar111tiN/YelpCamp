//===========AUTHORIZATION MIDDLEWARE==============
const Campground = require('../models/campground');
const Comment = require('../models/comment');

let middlewareObject = {};

// only checkes whether user is logged in
middlewareObject.isLoggedIn = (req, res, next) => 
    (req.isAuthenticated()) 
    ?   next()
    :   (  // Here comes the flash message (before the redirect!!)
        req.flash('error', 'Please Login First!'),
        res.redirect('/login')
        )

    //  Comment Authorization || currentUser._id = comment.author.id
middlewareObject.authComment = (req, res, next) => {
    (req.isAuthenticated())
    ?   Comment.findById(req.params.commentId, (err, foundComment) => 
            (err) 
                ? res.redirect('back')
                : (!foundComment.author.id.equals(req.user._id))
                    ?   (
                        req.flash('error', 'You do not have the permission'),
                        res.redirect('back')
                        )
                    : next()
        )
    :   (
        req.flash('error', 'You need to be logged in!'),
        res.redirect('/login')
        )
}

middlewareObject.authCampground = (req, res, next) => {
    (req.isAuthenticated())
    ?   Campground.findById(req.params.id, (err, foundCampground) => 
            (err)
                ?   (
                    req.flash('error', 'Campground not found'),
                    res.redirect('back')
                    )
                :   (foundCampground.author && foundCampground.author.id.equals(req.user._id))
                    ?   next()
                    :   (
                        req.flash('error', 'You do not have the permission'),
                        res.redirect('back')
                        )      
        )
    : (
        req.flash('error', 'You need to be logged in!'),
        res.redirect('/login')
        )
}

module.exports = middlewareObject