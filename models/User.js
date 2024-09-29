const mongoose = require("mongoose");

// Define the User schema
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
        unique: true,  // Ensure email is unique
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        data: Buffer,   // Store image as a binary Buffer
        contentType: String // Store the content type (e.g., image/jpeg)
    },
    address: {
        type: String,
        default: ""    // Empty string if no address provided
    },
    phoneNumber: {
        type: String,
        default: ""    // Empty string if no phone number provided
    },
    isAdmin: {
        type: Boolean,
        default: false // Default to false for normal users
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
