const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
if (process.env.NODE_ENV != "prodcution") {
    process.env.MONGODB_URI = process.env.MONGODB_URI_DEV;
    process.env.DB_NAME = process.env.DB_NAME_DEV;
} else {
    process.env.MONGODB_URI = process.env.MONGODB_URI_PROD;
    process.env.DB_NAME = process.env.DB_NAME_PROD;
}
const { getUser } = require('../sessionHandler'); // Adjusted to the same folder


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        databaseName: process.env.DB_NAME,
        collectionName: "sessions",
    }),
    cookie: {
        maxAge: 30 * 60 * 1000
    }
});

const userMiddleware = async (req, res, next) => {
    res.locals.user = await getUser(req); // Retrieve user data and attach it to res.locals
    res.locals.currentRoute = req.path; // Pass the current route to the views
    next(); // Call the next middleware or route handler
};

const userStatusMiddleware = (req, res, next) => {
    res.locals.userLoggedIn = req.session.userId ? true : false; // Check if the user is logged in
    next(); // Proceed to the next middleware/route handler
};

module.exports = {sessionMiddleware, userMiddleware, userStatusMiddleware}; // Ensure this line is present
