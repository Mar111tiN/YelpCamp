const express = require('express');
//define variable router to pass routes to app.js via module.exports
        // mergeParams allows the getting of req.params from the full routing path
const router = express.Router({mergeParams: true});        
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const flash = require('connect-flash');
router.use(flash());

//==============COMMENT ROUTES
//SHOW CREATE COMMENT ROUTE
router.get('/new', middleware.isLoggedIn, (req, res) =>
    Campground.findById(req.params.id).populate('comments').exec((err, foundCampGround) =>
        (err) 
        ? console.log(err)
        : res.render('comments/new', {campground: foundCampGround})      
    )
)

//CREATE COMMENT ROUTE
router.post('/', middleware.isLoggedIn, (req, res) => {
    let newComment = req.body.comment;
    let id = req.params.id;
    Campground.findById(id, (err, campground) => 
        (err) 
        ?   (
            console.log(err),
            res.redirect('/campgrounds')
            )
        :   Comment.create(newComment, (err, comment) => 
            (err) 
            ? console.log(err)
            :   (
                comment.author.id = req.user._id,
                comment.author.username = req.user.username,
                comment.save(),
                req.flash('success', 'New Comment added'),
                campground.comments.push(comment),
                campground.save(),
                res.redirect('/campgrounds/' + req.params.id)
                )
            )
    )
});


// ======SHOW EDIT COMMENTS PAGE
router.get('/:commentId/edit', middleware.authComment, (req, res) => {
    let cId = req.params.commentId;
    Comment.findById(cId, (err, comment) => 
        (err) 
        ? console.log(err)
        : Campground.findById(req.params.id, (err, campground) => 
            (err) 
            ? console.log(err)
            : res.render('comments/edit', {comment: comment, campground:campground})            
        )       
    )
});

// ======EDIT COMMENTS PAGE
router.put('/:commentId', middleware.authComment, (req, res) => 
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, editComment) => 
        (err) 
        ?   (
            res.redirect('back'),
            console.log(err)
            )
        :   res.redirect('/campgrounds/' + req.params.id)
        
    )
);

//----------DESTROY COMMENTS-----------
router.delete('/:commentId', middleware.authComment, (req, res) => 
        Comment.findByIdAndRemove(req.params.commentId, (err, deleted) => 
            (err) 
            ?   
            (
                console.log(err),
                res.redirect('back')
            )
            :   
            (
                req.flash('success', 'Comment has been removed'),
                res.redirect('/campgrounds/' + req.params.id)
            )
    )
);


module.exports = router;