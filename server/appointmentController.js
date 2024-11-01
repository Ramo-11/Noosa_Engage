const Appointment = require("../models/appointments")
const User = require('../models/User')
const { sendDeleteAppointmentEmail } = require("./mail")

const getAppointments = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login")
    }

    try {
        const user = await User.findById(req.session.userId).select('name email')
        if (!user) {
            return res.status(404).send("User not found")
        }

        const appointments = await Appointment.find({ user: user._id }).sort({ appointmentDate: -1 })

        res.render("dashboard/appointments", {
            user,
            appointments,
            currentRoute: 'appointments'
        })
    } catch (err) {
        console.error("Error fetching appointments:", err)
        return res.status(500).send("Internal server error")
    }
}

const createAppointment = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login")
    }

    const { fullName, date: appointmentDate, time, tutor, duration, description } = req.body

    try {
        const user = await User.findById(req.session.userId).select('name')
        if (!user) {
            return res.status(404).send("User not found")
        }

        const newAppointment = new Appointment({
            user: user._id,
            userName: fullName,
            tutorName: tutor,
            appointmentDate,
            time,
            duration,
            description
        })

        await newAppointment.save()

        next()
    } catch (err) {
        console.error("Error creating appointment:", err)
        return res.status(500).send("Internal server error")
    }
}

const deleteAppointment = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login")
    }

    try {
        const appointmentId = req.params.id
        const userId = req.session.userId
    
        const appointment = await Appointment.findOneAndDelete({ _id: appointmentId, user: userId })
    
        if (!appointment) {
            return res.status(404).send("Appointment not found or you don't have permission to cancel this.")
        }
    
        const user = await User.findById(userId).select('email firstName lastName')
        if (!user) {
            return res.status(404).send("User not found")
        }

        const fullName = `${user.firstName} ${user.lastName}`


        await sendDeleteAppointmentEmail({ email: user.email, fullName }, appointment)
    
        res.send({ message: "Appointment canceled successfully" })
    
    } catch (err) {
        console.error("Error canceling appointment:", err)
        return res.status(500).send("Internal server error")
    }
}

module.exports = { getAppointments, createAppointment, deleteAppointment }