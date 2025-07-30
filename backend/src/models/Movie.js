// backend/src/models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true, // Ensure custom IDs like 'M001' are unique
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    poster: {
        type: String, // URL to movie poster image
        trim: true
    },
    rating: {
        type: String, // e.g., 'U', 'UA', 'A'
        trim: true
    },
    language: {
        type: String,
        trim: true
    },
    duration: {
        type: String, // e.g., '2h 46min'
        trim: true
    },
    synopsis: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Movie', MovieSchema);