const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const pendingUserSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    profilePicture: { 
        type: String, 
        default: "https://res.cloudinary.com/dqtle5upc/image/upload/v1655088388/default_user_icon_vr0gng.jpg" 
    },
    verificationCode: { type: String, required: true },
    verificationExpires: { type: Date, required: true },

    expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000),
    expires: 0
  }
}, { timestamps: true });

// Hash password before saving (like in User)
pendingUserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
module.exports = PendingUser;
