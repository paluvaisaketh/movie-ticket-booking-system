// backend/src/models/SeatTemplate.js
const mongoose = require('mongoose');

const SeatTemplateSchema = new mongoose.Schema({
    _id: {
        type: String, // Custom ID, e.g., "template_screen_1"
        required: true,
        unique: true,
        trim: true
    },
    screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen', // Reference to the Screen this template applies to
        required: true,
        unique: true // A screen should only have one active seat template
    },
    seats: [{ // Array of seat objects defining the default layout for this screen
        seat_number: {
            type: String,
            required: true,
            trim: true
        }, // Unique identifier for the seat (e.g., "A1", "C12")
        seat_type: {
            type: String,
            enum: ['normal', 'premium', 'VIP', 'accessible'], // Added 'accessible' as an example type
            default: 'normal'
        },
        price_multiplier: { // Optional: A multiplier for this seat type's price, relative to normal/premium
            type: Number,
            default: 1.0,
            min: 0
        }
    }]
});

module.exports = mongoose.model('SeatTemplate', SeatTemplateSchema);