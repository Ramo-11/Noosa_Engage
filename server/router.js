const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const getCourseData = require("./courseData");


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))
route.get('/courses/:courseName', (req, res) => {
    getCourseData(req.params.courseName, (err, course) => {
        if (err) {
            return res.status(404).send('Course not found');
        }
        res.render('course', course);
    });
});

// *********** POST requests **********
route.post("/api/sendEmail", sendEmail)
route.post("/api/scheduleAppointment", sendAppointmentEmail)

module.exports = route