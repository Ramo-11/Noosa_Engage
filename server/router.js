const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const processScheduleRequest = require("./scheduleController")
const renderCoursePage = require("./courseController")
const {logout, loginUser, signupUser } = require("./session/sessionHandler")


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get('/courses/:courseName', renderCoursePage)
route.get("/login", (req, res) => res.render("login"))
route.get("/signup", (req, res) => res.render("signup"))
route.get('/logout', logout);

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", processScheduleRequest)
route.post("/api/login", loginUser)
route.post("/api/signup", signupUser)

module.exports = route