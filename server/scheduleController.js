const nodemailer = require('nodemailer');
const { generalLogger } = require('../utils/generalLogger');
const validateEmail = require('../utils/emailValidator');

async function processScheduleRequest(req, res) {
    const { fullName, email, course } = req.body;

    if (!fullName || !email || !course) {
        generalLogger.error("Error scheduling appointment: one or more fields are missing");
        return res.status(400).send({ message: "Error: All fields must be completed" });
    }

    if (!validateEmail(email)) {
        generalLogger.error("Error scheduling appointment: Invalid email address");
        return res.status(400).send({ message: "Error: Invalid email address" });
    }

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    });

    // Email for the client
    let clientEmail = `
        <p>Dear ${fullName},</p>
        <p>Your appointment has been scheduled for <strong>${course}</strong>. We will contact you shortly to find a date and a time to meet. Please contact us if you have any questions.</p>
        <p>Sincerely,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> +15744064727<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `;

    // Email for Noosa Engage
    let adminEmail = `
    <p>a new appointment has been scheduled for <strong>${course}</strong> with <strong>${fullName}</strong>.</p>
    <p>Email: <strong>${email}</strong>.</p>
    `;

    // Sending email to the user
    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Appointment Confirmation for class ${course}`,
        html: clientEmail
    };

    mailTransporter.sendMail(userDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to user: ", error);
        } else {
            generalLogger.info("User email was sent successfully");
        }
    });

    // Sending email to Noosa Engage
    let adminDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `New Appointment: ${fullName}`,
        html: adminEmail
    };

    mailTransporter.sendMail(adminDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send email to Noosa Engage: ", error);
            return res.status(400).send({ message: "Appointment email was not sent" });
        } else {
            generalLogger.info("Admin email was sent successfully");
            return res.status(200).send({ message: "Appointment was scheduled" });
        }
    });
}

module.exports = processScheduleRequest;
