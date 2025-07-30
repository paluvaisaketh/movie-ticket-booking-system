// backend/src/models/MovieFormat.js
const mongoose = require('mongoose');

const MovieFormatSchema = new mongoose.Schema({
    movie_id: {
        type: String,
        ref: 'Movie', // Reference to Movie._id
        required: true
    },
    format: {
        type: String,
        required: true,
        trim: true,
        enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'] // Example formats, adjust as needed
    }
});

// Compound index to prevent duplicate format entries for the same movie
MovieFormatSchema.index({ movie_id: 1, format: 1 }, { unique: true });

module.exports = mongoose.model('MovieFormat', MovieFormatSchema);