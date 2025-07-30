// backend/src/models/ShowSeat.js
const mongoose = require('mongoose');

const ShowSeatSchema = new mongoose.Schema({
    _id: {
        type: String, // Custom ID, uniquely identifies this seat status for a specific show (e.g., "show_seats_123")
        required: true,
        unique: true,
        trim: true
    },
    show_id: {
        type: Number, // Reference to the Show._id (number)
        ref: 'Show',
        required: true,
        unique: true // Ensures only one ShowSeat document per Show
    },
    screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true // Denormalized for convenience in queries
    },
    seats: [{ // Array of seat objects with their current status for *this specific show instance*
        seat_number: {
            type: String,
            required: true,
            trim: true
        },
        seat_type: { // This can be denormalized from SeatTemplate for easy access
            type: String,
            enum: ['normal', 'premium', 'VIP', 'accessible'],
            default: 'normal'
        },
        status: {
            type: String,
            enum: ['available', 'booked', 'blocked'],
            default: 'available',
            required: true
        },
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null // Null if not booked, references the Booking if booked
        }
    }]
});

module.exports = mongoose.model('ShowSeat', ShowSeatSchema);