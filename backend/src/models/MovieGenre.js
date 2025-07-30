// backend/src/models/MovieGenre.js
const mongoose = require('mongoose');

const MovieGenreSchema = new mongoose.Schema({
    movie_id: {
        type: String,
        ref: 'Movie', // Reference to Movie._id
        required: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    }
});

// Compound index to prevent duplicate genre entries for the same movie
MovieGenreSchema.index({ movie_id: 1, genre: 1 }, { unique: true });

module.exports = mongoose.model('MovieGenre', MovieGenreSchema);