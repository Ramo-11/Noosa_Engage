const mongoose = require("mongoose")
const { generalLogger } = require("../utils/generalLogger")

const connectDB = async() => {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI)
        generalLogger.info(`MongoDB connected successfully: ${con.connection.host}`)
    } catch(error) {
        generalLogger.error("unable to connect to database: are you sure the IP address is whitelisted in the database?\n")
        generalLogger.debug(error)
    }
}

module.exports = connectDB