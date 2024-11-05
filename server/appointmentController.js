const nodemailer = require('nodemailer')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { generalLogger } = require('./utils/generalLogger')
const validateEmail = require('./utils/emailValidator')
const { sendAppointmentConfirmationEmail } = require('./mail')

async function processAppointmentRequest(req, res) {
    try {
        const { course, date, time, user } = await validateAppointmentRequest(req)
        
        const newAppointment = new Appointment({
            customer: user._id,
            courseName: course,
            appointmentDate: date,
            appointmentTime: time
        })

        await newAppointment.save()

        sendAppointmentConfirmationEmail(user.fullName, course, date, time, user.email, res)
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
    const { course, date, time } = req.body

    if (!course || !date || !time) {
        throw new Error("Error: All fields must be completed")
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
        throw new Error("User not found")
    }

    return { course, date, time, user }
}

module.exports = { processAppointmentRequest, cancelAppointment }
