const mongoose = require('mongoose');

const ScreenSchema = new mongoose.Schema({
    theatre_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre', // Reference to the Theatre
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
});

// Compound index to ensure screen names are unique within a theatre
ScreenSchema.index({ theatre_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Screen', ScreenSchema);