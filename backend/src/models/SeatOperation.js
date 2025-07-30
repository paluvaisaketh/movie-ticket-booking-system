// backend/src/models/SeatOperation.js
const mongoose = require('mongoose');

const SeatOperationSchema = new mongoose.Schema({
    seat_id: { // The seat number string (e.g., 'A1', 'VIP5')
        type: String,
        required: true,
        trim: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the Admin User who performed the action
        required: true
    },
    action: {
        type: String,
        enum: ['block', 'unblock'], // Type of operation
        required: true
    },
    reason: {
        type: String, // Reason for the operation (e.g., 'Maintenance', 'VIP block')
        required: true, // Making reason required for better logging
        trim: true
    },
    show_id: { // Adding show_id to link operation to a specific show's seats
        type: Number,
        ref: 'Show',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SeatOperation', SeatOperationSchema);