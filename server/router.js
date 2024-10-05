const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const getCourseData = require("./courseData");
const renderCoursePage = require("./courseController");


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get('/courses/:courseName', renderCoursePage)

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", sendAppointmentEmail)

module.exports = route