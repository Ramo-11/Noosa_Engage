const express = require("express")
const route = express.Router()
const { sendEmail } = require("./mail")
const { processAppointmentRequest, cancelAppointment } = require("./appointmentController")
const renderCoursePage = require("./courseController")
const { getUserAppointments, getUserInvoices, renderHomePage, updateUser } = require("./user/userController")
const { renderLandingPageIfNotAuthenticated, renderUserHomePageIfAuthenticated, isAuthenticated, logout, loginUser, signupUser } = require("./session/sessionHandler")
const { validateResetCode, renderUpdatePassword, resetPassword, updatePassword } = require("./passwordController")
const { payInvoice } = require("./invoiceController")
const multer = require("./pictureHandlers/multer");


// *********** GET requests **********
route.get("/", renderUserHomePageIfAuthenticated, (req, res) => res.render("index"))
route.get("/schedule", isAuthenticated, (req, res) => res.render("schedule"));
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get("/profile", (req, res) => res.render("profile"))
route.get('/courses/:courseName', renderCoursePage)
route.get("/login", (req, res) => res.render("login"))
route.get("/home", renderLandingPageIfNotAuthenticated, getUserAppointments, getUserInvoices, renderHomePage);
route.get("/signup", (req, res) => res.render("signup"))
route.get('/logout', logout);
route.get("/forgotpassword", (req, res) => res.render("forgotpassword"))
route.get('/updatepassword', validateResetCode, renderUpdatePassword);

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", processAppointmentRequest)
route.post("/api/cancelAppointment", cancelAppointment)
route.post("/api/login", loginUser)
route.post("/api/signup", signupUser)
route.post('/api/forgotPassword', resetPassword)
route.post('/api/updatePassword', updatePassword)
route.post('/api/payInvoice', payInvoice)
route.post("/api/updateUserInfo", isAuthenticated, multer.single("picture"), updateUser)


module.exports = route