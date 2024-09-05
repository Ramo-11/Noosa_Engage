const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const { getAvailableTimes, getAvailableTimesForTutorAndDate } = require("../availableTimesHandler/availableTimesLoader"); // Import the function


// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", async (req, res) => {
    try {
        const availableTimes = await getAvailableTimes(); // Fetch all available times
        res.render("schedule", { availableTimes });
    } catch (error) {
        console.error("Error reading availableTimes.json:", error);
        res.status(500).send("Internal Server Error");
    }
});

route.get("/api/getAvailableTimesForTutorAndDate", async (req, res) => {
    const { tutor, date } = req.query; // Both tutor and date should be passed as query parameters
    try {
        const times = await getAvailableTimesForTutorAndDate(tutor, date); // Fetch available times
        res.json(times);
    } catch (error) {
        console.error("Error getting available times for tutor and date:", error);
        res.status(500).send("Internal Server Error");
    }
});
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))



// *********** POST requests **********
route.post("/api/sendemail", sendEmail)
route.post("/api/scheduleappointment", sendAppointmentEmail)

module.exports = route