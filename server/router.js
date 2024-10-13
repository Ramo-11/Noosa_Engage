const express = require("express")
const route = express.Router()
const renderCoursePage = require("./courseController");
const {sendEmail, sendAppointmentEmail} = require("./mail");
const {getInvoicesForUser, createInvoiceForUser} = require("./invoiceHandler");
const { getProfile, logout, loginUser, getDashboard, signUpUser, updateProfile } = require("./sessionHandler");
const { upload, profilePictureHandler } = require('./profilePictureHandler');
const {getAppointments, createAppointment, deleteAppointment} = require("./appointmentHandler");



// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get('/courses/:courseName', renderCoursePage)
route.get("/login", (req, res) => res.render("login"))
route.get("/signup", (req, res) => res.render("signup"))
route.get("/dashboard/createInvoice", (req, res) => res.render("dashboard/createInvoices"));
route.get("/dashboard/profile", getProfile);
route.get("/dashboard", getDashboard);
route.get('/logout', logout);
route.get('/dashboard/invoices', getInvoicesForUser);
route.get("/dashboard/appointments", getAppointments);

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", createAppointment, sendAppointmentEmail)
route.post("/api/signup", signUpUser);
route.post("/api/login", loginUser);
route.post('/api/editprofile', updateProfile);
route.post('/api/profilepictureupload', upload.single('profilePicture'), profilePictureHandler);
route.post('/api/createInvoice', createInvoiceForUser); // Make sure this matches

// *********** DELETE requests **********
route.delete('/api/appointments/:id', deleteAppointment);




module.exports = route
