const nodemailer = require('nodemailer')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { generalLogger } = require('./utils/generalLogger')
const validateEmail = require('./utils/emailValidator')
const { sendAppointmentConfirmationEmail } = require('./mail')

async function processAppointmentRequest(req, res) {
    try {
        const { fullName, email, course, date, time, user } = await validateAppointmentRequest(req)
        
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

async function validateAppointmentRequest(req) {
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

module.exports = { processAppointmentRequest, cancelAppointment }
