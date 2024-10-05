// ********** Imports **************
const express = require("express");
const router = require("./server/router");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { generalLogger } = require("./utils/generalLogger");
const connectDB = require('./server/connectDB');
const {sessionMiddleware, userStatusMiddleware,userMiddleware} = require("./server/middleWare/sessionController");
// ********** End Imports **********

// ********** Initialization **************
const app = express();
require('dotenv').config();
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(userStatusMiddleware);
app.use(userMiddleware);
app.use("/", router);


// Set view engine
app.set("view engine", "ejs");

// Start the server
app.listen(process.env.PORT, () => generalLogger.info(`server running on port: http://localhost:${process.env.PORT}`));
