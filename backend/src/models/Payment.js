// backend/src/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', // Reference to the Booking
        required: true,
        unique: true // A booking typically has one primary payment
    },
    original_amount: {
        type: Number,
        required: true,
        min: 0
    },
    final_amount: { // Final amount processed in the payment (should match booking.final_amount)
        type: Number,
        required: true,
        min: 0
    },
    payment_method: {
        type: String,
        required: true,
        trim: true // e.g., 'credit_card', 'UPI', 'cash', 'voucher'
    },
    receipt_number: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents to have null or undefined for this field
        trim: true
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'failed', 'refunded'], // Payment status
        required: true
    },
    transaction_id: { // Optional: ID from the payment gateway
        type: String,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);