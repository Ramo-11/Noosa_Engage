const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")
const sendAppointmentEmail = require("./appointmentEmail");
const { getAvailableTimes, getAvailableTimesForDate } = require("../availableTimesHandler/availableTimesLoader"); // Import the function


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

route.get("/api/getAvailableTimesForDate", async (req, res) => {
    const { date } = req.query; // Assume date is passed as a query parameter
    try {
        const times = await getAvailableTimesForDate(date); // Fetch available times for the specific date
        res.json(times);
    } catch (error) {
        console.error("Error getting available times for date:", error);
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