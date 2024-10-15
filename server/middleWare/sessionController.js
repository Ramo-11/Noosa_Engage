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
    const userData = await getUser(req);
    res.locals.user = userData.user; // Attach user object
    res.locals.userLoggedIn = userData.isLoggedIn; // Attach login status
    res.locals.currentRoute = req.path; // Current route
    next();
};

module.exports = {sessionMiddleware, userMiddleware}; // Ensure this line is present
