const express = require("express")
require('dotenv').config()
if (process.env.NODE_ENV != "production") {
    process.env.STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY_TEST
} else {
    process.env.STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY_PROD
}

const route = express.Router()
const { sendEmail } = require("./mail")
const { processAppointmentRequest, cancelAppointment } = require("./appointmentController")
const renderCoursePage = require("./courseController")
const { getUserData, renderHomePage, updateUser } = require("./user/userController")
const { renderLandingPageIfNotAuthenticated, renderUserHomePageIfAuthenticated, isAuthenticated, logout, loginUser, signupUser } = require("./session/sessionHandler")
const { validateResetCode, renderUpdatePassword, resetPassword, updatePassword } = require("./passwordController")
const { payInvoice, confirmInvoicePayment } = require("./invoiceController")
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
route.get("/payment-success", (req, res) => res.render("payment-success"))
route.get("/pay", isAuthenticated, (req, res) => {
    res.render("pay", { stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
})
route.get("/home", renderLandingPageIfNotAuthenticated, getUserData, renderHomePage);
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
route.post('/api/confirmInvoicePayment', confirmInvoicePayment)
route.post("/api/updateUserInfo", isAuthenticated, multer.single("picture"), updateUser)


module.exports = route