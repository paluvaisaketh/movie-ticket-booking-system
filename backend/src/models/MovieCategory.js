    // backend/src/models/MovieCategory.js
const mongoose = require('mongoose');

const MovieCategorySchema = new mongoose.Schema({
    movie_id: {
        type: String,
        ref: 'Movie', // Reference to Movie._id
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['recent', 'recommended', 'upcoming', 'popular', '3d'] // Example categories, adjust as needed
    }
});

// Compound index to prevent duplicate category entries for the same movie
MovieCategorySchema.index({ movie_id: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('MovieCategory', MovieCategorySchema);