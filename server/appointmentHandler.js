//#region Imports
const Appointment = require("../models/appointments");   // Make sure to adjust the path
const User = require('../models/User'); // Assuming the User model is in models folder
const { sendDeleteAppointmentEmail } = require("./mail");
//#endregion

//#region Methods

/**
 * @summary This Gets the Appointments for the User logged in
 */
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

/**
 * @summary This Creates and Appointment
 */
const createAppointment = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    const { fullName, date: appointmentDate, time, tutor, duration, description } = req.body;

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
        // Save the appointment to the database
        await newAppointment.save();

        next();
    } catch (err) {
        console.error("Error creating appointment:", err);
        return res.status(500).send("Internal server error");
    }
};

/**
 * @summary This Deletes an appointment
 */
const deleteAppointment = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    try {
        const appointmentId = req.params.id;
        const userId = req.session.userId;
    
        // Find and delete the appointment
        const appointment = await Appointment.findOneAndDelete({ _id: appointmentId, user: userId });
        
    
        if (!appointment) {
            // Appointment not found or user is not authorized
            return res.status(404).send("Appointment not found or you don't have permission to cancel this.");
        }
    
        // Fetch the user details and concatenate firstName and lastName to get fullName
        const user = await User.findById(userId).select('email firstName lastName');
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Concatenate firstName and lastName to get fullName
        const fullName = `${user.firstName} ${user.lastName}`;


        // Send cancellation email
        await sendDeleteAppointmentEmail({ email: user.email, fullName }, appointment);
    
        // Respond with success
        res.send({ message: "Appointment canceled successfully" });
    
    } catch (err) {
        console.error("Error canceling appointment:", err);
        return res.status(500).send("Internal server error");
    }
};



//#endregion

//#region Exports
module.exports = { getAppointments, createAppointment, deleteAppointment };
//#endregion

