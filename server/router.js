const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const { getAvailableTimesRouteHandler, renderSchedulePageHandler, getAvailableDatesRouteHandler } = require("../availableTimesHandler/availableTimesLoader"); // Import the function


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get('/schedule', renderSchedulePageHandler);
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get("/termsandconditions", (req, res) => res.render("termsandconditions"))


route.get('/api/getAvailableTimesForTutorAndDate', getAvailableTimesRouteHandler);
route.get('/api/getAvailableDatesForTutor', getAvailableDatesRouteHandler);

// *********** POST requests **********
route.post("/api/sendemail", sendEmail)
route.post("/api/scheduleappointment", sendAppointmentEmail)

module.exports = route