    // backend/src/models/BookingOffer.js
const mongoose = require('mongoose');

const BookingOfferSchema = new mongoose.Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', // Reference to the Booking
        required: true
    },
    offer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer', // Reference to the Offer
        required: true
    },
    discount_amount: {
        type: Number,
        required: true,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent applying the same offer multiple times to one booking
BookingOfferSchema.index({ booking_id: 1, offer_id: 1 }, { unique: true });

module.exports = mongoose.model('BookingOffer', BookingOfferSchema);