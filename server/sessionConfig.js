const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI, // Use only the base MongoDB URI
        databaseName: process.env.DB_NAME, // Specify the database name separately
        collectionName: "sessions",
    }),
    cookie: {
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
});

module.exports = sessionMiddleware; // Ensure this line is present
