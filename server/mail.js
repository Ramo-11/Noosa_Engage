const nodemailer = require("nodemailer")
const { generalLogger } = require("./utils/generalLogger")
require('dotenv').config()

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
            pass: process.env.EMAIL_PASSWORD
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
    const { email, fullName } = user

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Welcome to Noosa Engage",
        text: `Hello ${fullName},\n\nThank you for signing up at Noosa Engage! We're excited to have you on board.\n\nBest regards,\nThe Noosa Engage Team`
    };

    mailTransporter.sendMail(details, (error) => {
        if (!error) {
            generalLogger.info(`Welcome email sent to ${email}`);
        } else {
            generalLogger.error("Failed to send welcome email");
            generalLogger.debug(error);
        }
    });
}

async function sendResetEmail(email, fullName, resetCode) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://noosaengage.com';

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Password Reset Request",
        html: `
            <p>Dear ${fullName},</p>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <p><a href="${baseUrl}/update-password?code=${resetCode}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Noosa Engage Team</p>
        `
    };

    mailTransporter.sendMail(details, (error) => {
        if (!error) {
            generalLogger.info(`Password reset email sent to ${email}`);
        } else {
            generalLogger.error("Failed to send password reset email");
            generalLogger.debug(error);
        }
    });
}

async function sendAppointmentConfirmationEmail(fullName, course, date, time, email, res) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    let clientEmail = `
        <p>Dear ${fullName},</p>
        <p>Your appointment has been scheduled with the following details:</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Date:</strong> ${date}<br></p>
        <p><strong>Time:</strong> ${time}<br></p>
        <p>We will be in touch with you shortly to confirm your appointment.</p>
        <p>Sincerely,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> +15744064727<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `

    let adminEmail = `
    <p>New Appointment:</p>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Date:</strong> ${date}<br></p>
    <p><strong>Time:</strong> ${time}</p>
    <p><strong>Email:</strong> ${email}</p>
    `

    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Appointment Confirmation for class ${course}`,
        html: clientEmail
    }

    mailTransporter.sendMail(userDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to user: ", error)
        } else {
            generalLogger.info("User email was sent successfully")
        }
    })

    let adminDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `New Appointment: ${fullName}`,
        html: adminEmail
    }

    mailTransporter.sendMail(adminDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to Noosa Engage: ", error)
            return res.status(400).send({ message: "Appointment email was not sent" })
        } else {
            generalLogger.info("Admin email was sent successfully")
            return res.status(200).send({ message: "Appointment was scheduled" })
        }
    })
}
async function sendNewInvoiceConfirmationEmail(fullName, invoiceNumber, hours, price, total, email, res) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    let clientEmail = `
        <p>Dear ${fullName},</p>
        <p>A new invoice has been posted for you</p>
        <p><strong>hours:</strong> ${hours}</p>
        <p><strong>price per hour: $</strong> ${price}<br></p>
        <p><strong>total: $</strong> ${total}<br></p>
        <p>Please pay the invoice online on noosaengage.com</p>
        <p>Sincerely,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> +15744064727<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `

    let adminEmail = `
    <p>New Invoice</p>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Hours:</strong> ${hours}</p>
    <p><strong>Price per hour:</strong> ${price}<br></p>
    <p><strong>Total:</strong> ${total}</p>
    <p><strong>Email:</strong> ${email}</p>
    `

    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `New Invoice ${invoiceNumber}`,
        html: clientEmail
    }

    mailTransporter.sendMail(userDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to user: ", error)
        } else {
            generalLogger.info("User email was sent successfully")
        }
    })
    let adminDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `New Invoice: ${fullName}`,
        html: adminEmail
    }

    mailTransporter.sendMail(adminDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to Noosa Engage: ", error)
            return res.status(400).send({ message: "Invoice email was not sent" })
        } else {
            generalLogger.info("Admin email was sent successfully")
            return res.status(200).send({ message: "Invoice was created" })
        }
    })

}
async function sendAppointmentCancellationEmail(fullName, course, date, time, email, res) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    let clientEmail = `
        <p>Dear ${fullName},</p>
        <p>Your appointment has been cancelled successfully. Appointment details:</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Date:</strong> ${date}<br></p>
        <p><strong>Time:</strong> ${time}<br></p>
        <p>Don't hesitate to schedule another appointment with us.</p>
        <p>Sincerely,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> +15744064727<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `

    let adminEmail = `
    <p>Appointment Cancelled:</p>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Date:</strong> ${date}<br></p>
    <p><strong>Time:</strong> ${time}</p>
    <p><strong>Email:</strong> ${email}</p>
    `

    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Appointment Cancellation for class ${course}`,
        html: clientEmail
    }

    mailTransporter.sendMail(userDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to user: ", error)
        } else {
            generalLogger.info("User email was sent successfully")
        }
    })

    let adminDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `Appointment Cancelled for ${fullName}`,
        html: adminEmail
    }

    mailTransporter.sendMail(adminDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to Noosa Engage: ", error)
            return res.status(400).send({ message: "Appointment email was not sent" })
        } else {
            generalLogger.info("Admin email was sent successfully.")
            return res.status(200).send({ message: "Appointment was cancelled" })
        }
    })
}

module.exports = { sendEmail, sendSignupEmail, sendResetEmail, sendAppointmentConfirmationEmail, sendAppointmentCancellationEmail, sendNewInvoiceConfirmationEmail }