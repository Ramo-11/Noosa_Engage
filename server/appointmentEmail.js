const nodemailer = require('nodemailer');
const { generalLogger } = require('../utils/generalLogger'); // Update the path if necessary

async function sendAppointmentEmail(req, res) {
    const { fullName, email, date, time } = req.body;

    if (!fullName || !email || !date || !time) {
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

    let description = `Your appointment has been scheduled for ${date} at ${time}. Please contact us if you need to reschedule or if you have any questions.`;

    let details = {
        from: "noosa@noosaengage.com",   // The sender's email address
        to: email,                            // The recipient's email address
        subject: `Appointment Confirmation: ${date} at ${time}`, // Added a subject for clarity
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

module.exports = sendAppointmentEmail;
