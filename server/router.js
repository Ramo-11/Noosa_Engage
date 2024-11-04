const express = require("express")
const route = express.Router()
const { sendEmail } = require("./mail")
const { processScheduleRequest, cancelAppointment } = require("./scheduleController")
const renderCoursePage = require("./courseController")
const { getUserAppointments, getUserInvoices, renderHomePage } = require("./user/userController")
const { renderLandingPageIfNotAuthenticated, renderUserHomePageIfAuthenticated, isAuthenticated, logout, loginUser, signupUser } = require("./session/sessionHandler")
const { resetPassword, updatePassword } = require("./passwordHandler")


// *********** GET requests **********
route.get("/", renderUserHomePageIfAuthenticated, (req, res) => res.render("index"))
route.get("/schedule", isAuthenticated, (req, res) => res.render("schedule"));
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get('/courses/:courseName', renderCoursePage)
route.get("/login", (req, res) => res.render("login"))
route.get("/home", renderLandingPageIfNotAuthenticated, getUserAppointments, getUserInvoices,renderHomePage);
route.get("/signup", (req, res) => res.render("signup"))
route.get('/logout', logout);
route.get("/forgotpassword", (req, res) => res.render("forgotpassword"))
route.get('/updatepassword', (req, res) => {
    const resetCode = req.query.code;
    if (!resetCode) {
        return res.status(400).send('Invalid reset code.')
    }
    res.render('updatepassword', { code: resetCode })
})

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", processScheduleRequest)
route.post("/api/cancelAppointment", cancelAppointment)
route.post("/api/login", loginUser)
route.post("/api/signup", signupUser)
route.post('/api/forgot_password', resetPassword)
route.post('/api/update_password', updatePassword)


module.exports = route