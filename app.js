// ********** Imports **************
const express = require("express")
const router = require("./server/router")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const { generalLogger } = require("./utils/generalLogger")
// ********** End Imports **********

// ********** Initialization **************
const app = express()
require("dotenv").config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"))
app.use(cookieParser())
// ********** End Initialization **********

app.use("/", router)

app.set("view engine", "ejs")

app.listen(process.env.PORT, () => generalLogger.info(`server running on port: http://localhost:${process.env.PORT}`))