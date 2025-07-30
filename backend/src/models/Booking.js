// backend/src/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    show_id: {
        type: Number,
        ref: 'Show',
        required: true
    },
    // Changed seat_ids from [String] to [{ seat_number: String, price: Number }]
    seats_booked: [{ // Array of booked seat objects
        seat_number: { type: String, required: true },
        seat_type: { type: String, enum: ['normal', 'premium', 'VIP', 'accessible'], required: true }, // Store the type for context
        price_at_booking: { type: Number, required: true, min: 0 } // Price for this specific seat at time of booking
    }],
    base_amount: { // Sum of prices_at_booking for all seats in seats_booked
        type: Number,
        required: true,
        min: 0
    },
    snacks_items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price_per_item: { type: Number, required: true, min: 0 },
        total_price: { type: Number, required: true, min: 0 }
    }],
    parking_charges: {
        type: Number,
        default: 0,
        min: 0
    },
    convenience_fee: {
        type: Number,
        default: 0,
        min: 0
    },
    discount_applied: {
        type: Number,
        default: 0,
        min: 0
    },
    final_amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'refunded', 'partially_cancelled'], // Added 'partially_cancelled'
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);