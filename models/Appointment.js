const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    tutorName: {
        type: String,
        required: true,
        trim: true
    },
    appointmentDate: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create the model
const appointments = mongoose.model('appointment', appointmentSchema);

module.exports = appointments;