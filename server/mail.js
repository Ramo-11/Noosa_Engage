const nodemailer = require("nodemailer")
const { generalLogger } = require("./utils/generalLogger")
require('dotenv').config()

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

module.exports = { sendSignupEmail, sendNewInvoiceConfirmationEmail }