const User = require('../models/User')
const { sendResetEmail } = require('./mail')
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const validateEmail = require('./utils/emailValidator')

function validateResetCode(req, res, next) {
    if (!req.query.code) return res.status(400).send('Invalid reset code.');
    next();
}

function renderUpdatePassword(req, res) {
    res.render('update-password', { code: req.query.code });
}

async function resetPassword(req, res) {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user || !user.email || !validateEmail(user.email)) {
            return res.status(400).send({ message: 'Email not found or email is not valid.' })
        }

        const resetCode = crypto.randomBytes(32).toString('hex')
        const resetCodeExpiration = Date.now() + 900000

        user.resetCode = resetCode
        user.resetCodeExpiration = resetCodeExpiration
        await user.save()

        await sendResetEmail(user.email, user.fullName, resetCode)

        return res.status(200).send({ message: "Reset email was sent successfully" })
    } catch (error) {
        console.error('Error resetting password:', error)
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' })
    }
}

async function updatePassword(req, res) {
    const { resetCode, newPassword } = req.body
    try {
        const user = await User.findOne({ resetCode })

        if (!user) {
            return res.status(400).send({ message: 'Invalid reset code.' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetCode = null
        await user.save()

        return res.status(200).send({ message: "Password was updated" })
    } catch (error) {
        console.error('Error updating password:', error)
        return res.status(500).send({ message: 'An error occurred. Please try again later.' })
    }
}

module.exports = {
    validateResetCode,
    renderUpdatePassword,
    resetPassword,
    updatePassword
}
