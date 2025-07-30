// backend/src/models/Offer.js
const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    discount_type: {
        type: String,
        enum: ['percentage', 'fixed'], // 'percentage' or 'fixed' amount
        required: true
    },
    discount_value: {
        type: Number,
        required: true,
        min: 0 // Discount value should not be negative
    },
    min_amount: {
        type: Number,
        default: 0,
        min: 0
    },
    max_discount: {
        type: Number,
        min: 0,
        // max_discount can be null or undefined if there's no cap
        validate: {
            validator: function(v) {
                // If discount_type is percentage, max_discount can be null or a positive number
                // If discount_type is fixed, max_discount usually doesn't apply or is same as discount_value
                return (this.discount_type === 'percentage' && (v === null || v === undefined || v >= 0)) ||
                       (this.discount_type === 'fixed' && (v === null || v === undefined || v === this.discount_value));
            },
            message: props => `${props.value} is not a valid max_discount for discount_type ${props.path}`
        }
    },
    valid_from: {
        type: Date,
        required: true
    },
    valid_to: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v >= this.valid_from; // Ensure valid_to is not before valid_from
            },
            message: 'Valid to date must be after or equal to valid from date'
        }
    },
    is_active: { // Add an active flag for easier management without changing dates
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Offer', OfferSchema);