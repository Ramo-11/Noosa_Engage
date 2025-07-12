const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    fullName: {
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
        type: String,
        default: "https://res.cloudinary.com/dqtle5upc/image/upload/v1655088388/default_user_icon_vr0gng.jpg"
    },
    address: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    resetCode: {
        type: String,
        default: null
    },
    resetCodeExpiration: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Hash password before saving (for both new users and password updates)
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Hash password before updating with findByIdAndUpdate
userSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    
    // Only hash if password is being updated
    if (update.password) {
        try {
            const hashedPassword = await bcrypt.hash(update.password, 12);
            update.password = hashedPassword;
        } catch (error) {
            return next(error);
        }
    }
    
    next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;