const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        } 
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,       //reference comments with userID
            ref: 'User'
        },
        username: String
    }
});

module.exports = mongoose.model('Campground', campSchema);