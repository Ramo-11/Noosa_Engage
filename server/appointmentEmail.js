const nodemailer = require('nodemailer');
const { generalLogger } = require('../utils/generalLogger'); // Update the path if necessary

async function sendAppointmentEmail(req, res) {
    const { fullName, email, date, time, tutor } = req.body;

    if (!fullName || !email || !date || !time || !tutor) {
        generalLogger.error("Cannot send email");
        generalLogger.debug("One or more fields are missing");
        return res.status(400).send({ message: "Error: All fields must be completed" });
    }

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    })

    const phoneNumbers = {
        "Mostafa Abdulaleem": "574-347-1217", // Phone number for Mostafa
        "Omar Abdelalim": "574-406-4727"     // Phone number for Omar
    };
    
    let description = `
        <p>Dear ${fullName},</p>
        <p>Your appointment has been scheduled for <strong>${date}</strong> at <strong>${time}</strong> with <strong>${tutor}</strong>. Please contact us if you need to reschedule or if you have any questions.</p>
        <p>Best regards,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> ${phoneNumbers[tutor] || '+000000000'}<br> <!-- Default number if tutor is not found -->
        <strong>Email:</strong> <a href="mailto:support@noosaengage.com">support@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `;

    let details = {
        from: "noosa@noosaengage.com",   // The sender's email address
        to: email,                            // The recipient's email address
        subject: `Appointment Confirmation: ${date} at ${time}`, // Added a subject for clarity
        html: description
    }

    mailTransporter.sendMail(details, (error) => {
        if (!error) { 
            generalLogger.info("Email was sent successfully")
            return res.status(200).send({ message: "Appointment was scheduled" })
        } else {
            generalLogger.error("Cannot send email")
            generalLogger.debug(error)
            return res.status(400).send({ message: "Email was not sent" })
        }
    })
}

module.exports = sendAppointmentEmail;
