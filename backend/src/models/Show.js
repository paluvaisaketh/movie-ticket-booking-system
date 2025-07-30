// backend/src/models/Show.js
const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
    _id: {
        type: Number, // Custom number ID for shows (e.g., 1, 5, 7)
        required: true,
        unique: true, // Ensure show IDs are unique
        min: 1
    },
    movie_id: {
        type: String,
        ref: 'Movie', // Reference to Movie._id (string)
        required: true
    },
    screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen', // Reference to Screen
        required: true
    },
    show_datetime: {
        type: Date,
        required: true,
        // Will be unique due to compound index below, no need for individual 'unique: true'
    },
    normal_price: {
        type: Number,
        required: true,
        min: 0
    },
    premium_price: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v >= this.normal_price; // Premium price should be >= normal price
            },
            message: 'Premium price must be greater than or equal to normal price'
        }
    },
    seating_layout_id: {
        type: String,
        required: true,
        unique: true // Each show has a unique seating layout document
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

// Compound index to ensure uniqueness of a show instance
ShowSchema.index({ movie_id: 1, screen_id: 1, show_datetime: 1 }, { unique: true });

module.exports = mongoose.model('Show', ShowSchema);