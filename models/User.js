const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        data: Buffer,
        contentType: String
    },
    address: {
        type: String,
        default: "" // Optional field
    },
    phoneNumber: {
        type: String,
        default: "" // Optional field
    },
    school: {
        type: String,
        default: "" // Optional field
    },
    grade: {
        type: String,
        default: "" // Optional field
    },
    subjects: {
        type: String,
        default: "" // Optional field
    },
    learningStyle: {
        type: String,
        default: "" // Optional field
    },
    goals: {
        type: String,
        default: "" // Optional field
    },
    learningChallenges: {
        type: String,
        default: "" // Optional field
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
