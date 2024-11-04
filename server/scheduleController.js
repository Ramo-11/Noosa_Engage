const nodemailer = require('nodemailer')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { generalLogger } = require('./utils/generalLogger')
const validateEmail = require('./utils/emailValidator')

async function processScheduleRequest(req, res) {
    try {
        const { fullName, email, course, date, time, user } = await validateScheduleRequest(req)
        
        const newAppointment = new Appointment({
            customer: user._id,
            courseName: course,
            appointmentDate: date,
            appointmentTime: time
        })

        await newAppointment.save()

        sendAppointmentConfirmationEmail(fullName, course, date, time, email, res)
        return res.status(200).send({ message: "Appointment was scheduled successfully" })

    } catch (err) {
        generalLogger.error("Error creating appointment:", err.message)
        return res.status(400).send({ message: err.message })
    }
}

async function cancelAppointment(req, res) {
    const appointmentId = req.body.appointmentId
    try {
        const appointmentToCancel = await Appointment.findById(appointmentId)
        appointmentToCancel.status = "Cancelled"
        await appointmentToCancel.save()

        generalLogger.debug("Appointment with id ", appointmentId, " was cancelled successfully")
        return res.status(200).send({ message: "Appointment was cancelled successfully" })

    } catch (err) {
        generalLogger.error("Error cancelling appointment with id ", appointmentId, ": ", err.message)
        return res.status(400).send({ message: err.message })
    }
}

async function validateScheduleRequest(req) {
    const { fullName, email, course, date, time } = req.body

    if (!fullName || !email || !course || !date || !time) {
        throw new Error("Error: All fields must be completed")
    }

    if (!validateEmail(email)) {
        throw new Error("Error: Invalid email address")
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
        throw new Error("User not found")
    }

    return { fullName, email, course, date, time, user }
}

async function sendAppointmentConfirmationEmail(fullName, course, date, time, email, res) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: "cxpy yaqy zllx mrqn"
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

module.exports = { processScheduleRequest, cancelAppointment }
