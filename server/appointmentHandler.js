const Appointment = require("../models/appointments");   // Make sure to adjust the path
const User = require('../models/User'); // Assuming the User model is in models folder
const getAppointments = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    try {
        // Fetch the user data
        const user = await User.findById(req.session.userId).select('name email');
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Fetch all appointments for the user and sort by appointmentDate in descending order
        const appointments = await Appointment.find({ user: user._id }).sort({ appointmentDate: -1 });

        res.render("dashboard/appointments", {
            user,
            appointments,  // Passing the list of appointments to the view
            currentRoute: 'appointments'
        });
    } catch (err) {
        console.error("Error fetching appointments:", err);
        return res.status(500).send("Internal server error");
    }
};

const createAppointment = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    const { fullName, date: appointmentDate, time, tutor, duration, description } = req.body;

    console.log(fullName, appointmentDate, time, tutor, duration, description);

    try {
        // Fetch the user data
        const user = await User.findById(req.session.userId).select('name');
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Create a new appointment using the incoming request data
        const newAppointment = new Appointment({
            user: user._id,
            userName: fullName,        // Use fullName from the request body
            tutorName: tutor,             // Initialize tutorName as empty string or provide it if available
            appointmentDate,           // Use date from the request body
            time,                      // Use time from the request body
            duration,                  // Use duration from the request body
            description                // Use description from the request body
        });

        console.log(newAppointment); // Log the new appointment details

        // Save the appointment to the database
        await newAppointment.save();

        next();
    } catch (err) {
        console.error("Error creating appointment:", err);
        return res.status(500).send("Internal server error");
    }
};

const deleteAppointment = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    try {
        const appointmentId = req.params.id;

        // Find and delete the appointment
        const result = await Appointment.findOneAndDelete({ _id: appointmentId, user: req.session.userId });

        if (!result) {
            return res.status(404).send("Appointment not found or you don't have permission to cancel this.");
        }

        res.send({ message: "Appointment canceled successfully" });
    } catch (err) {
        console.error("Error canceling appointment:", err);
        return res.status(500).send("Internal server error");
    }
};

module.exports = { getAppointments, createAppointment, deleteAppointment };
