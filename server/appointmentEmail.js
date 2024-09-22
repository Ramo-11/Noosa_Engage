const nodemailer = require('nodemailer');
const { generalLogger } = require('../utils/generalLogger');
const validateEmail = require('../utils/emailValidator');

async function sendAppointmentEmail(req, res) {
    const { fullName, email, date, time, tutor } = req.body;

    if (!fullName || !email || !date || !time || !tutor) {
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

    const phoneNumbers = {
        "Mostafa Abdulaleem": "574-347-1217",
        "Omar Abdelalim": "574-406-4727"
    };

    // Email for the user
    let userDescription = `
        <p>Dear ${fullName},</p>
        <p>Your appointment has been scheduled for <strong>${date}</strong> at <strong>${time}</strong> with <strong>${tutor}</strong>. Please contact us if you need to reschedule or if you have any questions.</p>
        <p>Best regards,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> ${phoneNumbers[tutor] || '+000000000'}<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `;

    // Email for Noosa Engage
    let adminDescription = `
    <p>a new appointment has been scheduled for <strong>${date}</strong> at <strong>${time}</strong> with <strong>${fullName}</strong>.</p>
    `;

    // Sending email to the user
    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Appointment Confirmation: ${date} at ${time}`,
        html: userDescription
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
        html: adminDescription
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

module.exports = sendAppointmentEmail;
