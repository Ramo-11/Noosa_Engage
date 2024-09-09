const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const { getAvailableTimesRouteHandler, renderSchedulePageHandler, getAvailableDatesRouteHandler } = require("./availableTimesHandler/availableTimesLoader"); // Import the function


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get('/schedule', renderSchedulePageHandler);
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get("/termsAndConditions", (req, res) => res.render("termsAndConditions"))


route.get('/api/getAvailableTimesForTutorAndDate', getAvailableTimesRouteHandler);
route.get('/api/getAvailableDatesForTutor', getAvailableDatesRouteHandler);

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", sendAppointmentEmail)

module.exports = route