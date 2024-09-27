// ********** Imports **************
const express = require("express");
const router = require("./server/router");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { generalLogger } = require("./utils/generalLogger");
const connectDB = require('./server/connectDB');
const sessionMiddleware = require("./server/middleWare/sessionConfig");
const userStatusMiddleware = require("./server/middleWare/userStatus"); 
const userMiddleware = require("./server/middleWare/userMiddleware"); 




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
app.use(sessionMiddleware); // Use session middleware
app.use(userStatusMiddleware); // Use user status middleware
app.use(userMiddleware);
app.use("/", router);


// Set view engine
app.set("view engine", "ejs");

// Start the server
app.listen(process.env.PORT, () => generalLogger.info(`server running on port: http://localhost:${process.env.PORT}`));
