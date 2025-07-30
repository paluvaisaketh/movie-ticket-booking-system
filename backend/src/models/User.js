// backend/src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false // Can be updated after initial login via OTP
    },
    email: {
        type: String,
        required: false, // Not required for OTP login
        unique: true,
        sparse: true, // Allows multiple documents to have null or undefined for this field
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'] // Basic 10-digit validation
    },
    password: {
        type: String,
        required: false // Optional, required only if traditional password login is also supported
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true
    },

    dob: { // Add this field
        type: Date, // Or String, depending on how you store dates (YYYY-MM-DD string is common for input type="date")
        required: false // Optional field
    },
    
    otp: {
        type: String,
        required: false // Stores the current OTP
    },
    otp_expiry: {
        type: Date,
        required: false // Expiry time for the OTP
    },
    is_verified: {
        type: Boolean,
        default: false // Indicates if the phone number is verified
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);