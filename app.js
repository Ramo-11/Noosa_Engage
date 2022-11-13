// ********** Imports **************
const express = require("express")
const router = require("./server/router")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
// ********** End Imports **********

// ********** Initialization **************
const app = express()
require("dotenv").config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"))
app.use(cookieParser())
app.set("view engine", "ejs")
// ********** End Initialization **********

app.use("/", router)

app.listen(process.env.PORT)