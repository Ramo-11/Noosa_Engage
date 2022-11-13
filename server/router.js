const express = require("express")
const route = express.Router()

route.get("/", (req, res) => res.render("index"))
route.get("/schedule", (req, res) => res.render("schedule"))

module.exports = route