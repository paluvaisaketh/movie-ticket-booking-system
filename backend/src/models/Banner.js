// backend/src/models/Banner.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    target_url: {
        type: String, // URL the banner links to
        trim: true
    },
    image_url: { // URL for the banner image itself
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: Number, // Display order or location
        min: 1,
        default: 1
    },
    is_active: {
        type: Boolean,
        default: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v >= this.start_date; // Ensure end_date is not before start_date
            },
            message: 'End date must be after or equal to start date'
        }
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the Admin User who created it (optional if system generated)
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', BannerSchema);