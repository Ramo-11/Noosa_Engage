const nodemailer = require("nodemailer")
const { generalLogger } = require("./utils/generalLogger")

async function sendEmail(req, res) {
    const { fullName, email, subject, description } = req.body

    if (!fullName || !email || !subject || !description) {
        generalLogger.error("Cannot send email")
        generalLogger.debug("one or more field is missing")
        return res.status(400).send({ message: "Error: All fields must be completed" })
    }

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    })

    let details = {
        from: email,
        to: "noosa@noosaengage.com", 
        subject: `Message from ${fullName}, with email ${email}: subject: ${subject}`,
        text: description
    }

    mailTransporter.sendMail(details, (error) => {
        if (!error) { 
            generalLogger.info("Email was sent successfully")
            return res.status(200).send({ message: "Email was sent successfully" })
        } else {
            generalLogger.error("Cannot send email")
            generalLogger.debug(error)
            return res.status(400).send({ message: "Email was not sent" })
        }
    })
}

async function sendSignupEmail(user) {
    const { email, firstName } = user

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    })

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Welcome to Noosa Engage",
        text: `Hello ${firstName},\n\nThank you for signing up at Noosa Engage! We're excited to have you on board.\n\nBest regards,\nThe Noosa Engage Team`
    }

    mailTransporter.sendMail(details, (error) => {
        if (!error) {
            generalLogger.info(`Welcome email sent to ${email}`)
        } else {
            generalLogger.error("Failed to send welcome email")
            generalLogger.debug(error);
        }
    })
}
async function sendResetEmail(email, fullName, resetCode) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    })

    let baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://noosaengage.com'

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Password Reset Request",
        html: `
            <p>Dear ${fullName},</p>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <p><a href="${baseUrl}/updatepassword?code=${resetCode}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Noosa Engage Team</p>
        `
    }

    mailTransporter.sendMail(details, (error) => {
        if (!error) {
            generalLogger.info(`Password reset email sent to ${email}`)
        } else {
            generalLogger.error("Failed to send password reset email")
            generalLogger.debug(error)
        }
    });
}

module.exports = { sendEmail, sendSignupEmail, sendResetEmail }