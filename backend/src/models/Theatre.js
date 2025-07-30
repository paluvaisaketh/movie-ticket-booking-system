const mongoose = require('mongoose');

const TheatreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Theatre', TheatreSchema);