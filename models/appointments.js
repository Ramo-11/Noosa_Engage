const mongoose = require("mongoose");

// Define the Appointment schema
const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model (assuming you already have a User model)
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
        type: String,  // You can use String to store time like '14:30' or '2:30 PM'
        required: true
    },
    duration: {
        type: Number,  // Duration in hours or minutes
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'  // Default status is "Scheduled"
    },
    description: {
        type: String,
        trim: true  // Optional description field for additional appointment notes
    },
    createdAt: {
        type: Date,
        default: Date.now  // Automatically set the creation date
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

// Create the model
const appointments = mongoose.model('appointment', appointmentSchema);

module.exports = appointments;
