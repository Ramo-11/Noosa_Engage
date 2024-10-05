const express = require("express")
const route = express.Router()
<<<<<<< HEAD
const {sendEmail} = require("./mail");
const sendAppointmentEmail = require("./appointmentEmail");
const renderCoursePage = require("./courseController");
const { getProfile, logout, loginUser, getDashboard, signUpUser, getInvoicesForUser, updateProfile } = require("./sessionControler");
=======
const {sendEmail, sendAppointmentEmail} = require("./mail");
const { getProfile, logout, loginUser, getDashboard, signUpUser, getInvoicesForUser, updateProfile } = require("./sessionHandler");
>>>>>>> de2153a (Added the appointments in the dashboard)
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
route.get("/dashboard/profile", getProfile);
route.get("/dashboard", getDashboard);
route.get('/logout', logout);
<<<<<<< HEAD
route.get('/dashboard/invoices', getInvoicesForUser); // Similar structure to the /dashboard route

=======
route.get('/dashboard/invoices', getInvoicesForUser);
route.get("/dashboard/appointments", getAppointments);
>>>>>>> de2153a (Added the appointments in the dashboard)

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", createAppointment, sendAppointmentEmail)
route.post("/api/signup", signUpUser);
route.post("/api/login", loginUser);
route.post('/api/editprofile', updateProfile);
route.post('/api/profilepictureupload', upload.single('profilePicture'), profilePictureHandler);
route.delete('/api/appointments/:id', deleteAppointment);




module.exports = route
