const User = require('../models/User');
const { sendResetEmail } = require('./mail');
const crypto = require('crypto');

async function resetPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found. Please check and try again.' });
        }

        const resetCode = crypto.randomBytes(32).toString('hex');
        const resetCodeExpiration = Date.now() + 900000;

        user.resetCode = resetCode;
        user.resetCodeExpiration = resetCodeExpiration;
        await user.save();

        await sendResetEmail(user, resetCode);

        return res.redirect(`/login?success=true&message=A password reset link has been sent to your email.`);
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
}

async function updatePassword(req, res) {
    const { resetCode, newPassword } = req.body;

    try {
        const user = await User.findOne({ resetCode });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset code.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = null;
        await user.save();

        return res.redirect('/login?message=Password has been reset successfully');
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
}

module.exports = {
    resetPassword,
    updatePassword,
};
