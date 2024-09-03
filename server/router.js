const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const { getAvailableSlots, getAvailableTimes } = require('./AppointmentsController'); // Correct casing

// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))

route.get('/api/available-slots', getAvailableSlots);
route.get('/api/available-times/:date', getAvailableTimes);


// *********** POST requests **********
route.post("/api/sendemail", sendEmail)
route.post("/api/scheduleappointment", sendAppointmentEmail)

module.exports = route