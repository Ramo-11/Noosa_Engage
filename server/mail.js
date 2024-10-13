//#region Imports
const nodemailer = require("nodemailer")
const { generalLogger } = require("../utils/generalLogger")
const validateEmail = require('../utils/emailValidator');
//#endregion

//#region Method
async function sendDeleteAppointmentEmail(user, appointment) {
    const { email, fullName } = user;
    const { appointmentDate, time, tutorName } = appointment;

    if (!email || !appointmentDate || !time || !tutorName) {
        generalLogger.error("Error sending appointment deletion email: one or more fields are missing");
        return;
    }

    if (!validateEmail(email)) {
        generalLogger.error("Error sending appointment deletion email: Invalid email address");
        return;
    }

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    });

    // Email for the user
    let userDescription = `
        <p>Dear ${fullName},</p>
        <p>Your appointment scheduled for <strong>${appointmentDate}</strong> at <strong>${time}</strong> with <strong>${tutorName}</strong> has been successfully canceled. If this was a mistake or you need further assistance, feel free to reach out to us.</p>
        <p>Best regards,</p>
        <p>Noosa Engage Team</p>
        <p><strong>Phone:</strong> +000000000<br>
        <strong>Email:</strong> <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
        <strong>Website:</strong> <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
    `;

    // Email for Noosa Engage
    let adminDescription = `
        <p>The following appointment has been canceled:</p>
        <p><strong>Date:</strong> ${appointmentDate}<br>
        <strong>Time:</strong> ${time}<br>
        <strong>User:</strong> ${fullName}<br>
        <strong>Tutor:</strong> ${tutorName}</p>
    `;

    // Sending email to the user
    let userDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Appointment Cancellation: ${appointmentDate} at ${time}`,
        html: userDescription
    };

    mailTransporter.sendMail(userDetails, (error) => {
        if (error) {
            generalLogger.error(`Cannot send cancellation email to user ${email}: `, error);
        } else {
            generalLogger.info(`Cancellation email was sent successfully to user ${email}`);
        }
    });

    // Sending email to Noosa Engage
    let adminDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `Appointment Canceled: ${fullName}`,
        html: adminDescription
    };

    mailTransporter.sendMail(adminDetails, (error) => {
        if (error) {
            generalLogger.error("Cannot send cancellation email to Noosa Engage: ", error);
        } else {
            generalLogger.info("Cancellation email was sent successfully to Noosa Engage");
        }
    });
}



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
    const { email, firstName } = user;  // Extract user info

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    });

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Welcome to Noosa Engage",
        text: `Hello ${firstName},\n\nThank you for signing up at Noosa Engage! We're excited to have you on board.\n\nBest regards,\nThe Noosa Engage Team`
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

async function sendForgotPasswordEmail(email, resetCode) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
        }
    });

    let details = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please use the following link to reset your password: \n\n http://yourwebsite.com/reset-password?code=${resetCode}\n\nIf you did not request this, please ignore this email.`
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
//#endregion

//#region Exports
module.exports  = { sendEmail, sendSignupEmail, sendForgotPasswordEmail, sendAppointmentEmail, sendDeleteAppointmentEmail};
//#endregion