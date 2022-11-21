const express = require("express")
const route = express.Router()
const sendEmail = require("./mail")

// *********** GET requests **********
route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))
route.get("/staff", (req, res) => res.render("staff"))
route.get("/prices", (req, res) => res.render("prices"))
route.get("/contact", (req, res) => res.render("contact"))

// *********** POST requests **********
route.post("/api/sendemail", sendEmail)

module.exports = route