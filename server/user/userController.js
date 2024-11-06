const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const Invoice = require("../../models/Invoice");
const { generalLogger } = require("../utils/generalLogger")
const validateEmail = require('../utils/emailValidator')
const cloudinary = require("../pictureHandlers/cloudinary")

const getProfile = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login")
    }

    try {
        const user = await User.findById(req.session.userId)
        if (!user) {
            return res.status(404).send({ message: "User not found" })
        }

        res.render("dashboard/profile", { user })
    } catch (err) {
        return res.status(500).send({ message: "Internal server error" })
    }
}

const getUser = async (req) => {
    if (!req.session || !req.session.userId) {
        return {
            isLoggedIn: false,
            user: null,
        }
    }

    try {
        const user = await User.findById(req.session.userId)
        if (!user) {
            return {
                isLoggedIn: false,
                user: null,
            }
        }

        return {
            isLoggedIn: true,
            user: user,
        }
    } catch (error) {
        console.error('Error fetching user:', error)
        return {
            isLoggedIn: false,
            user: null,
        }
    }
}

async function getUserAppointments(req, res, next) {
    try {
        const userId = req.session.userId;
        const appointments = await Appointment.find({ customer: userId }).lean();

        req.session.user = { ...req.session.user, appointments: appointments }; // Explicitly set appointments
        
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error fetching appointments" });
    }
}

async function getUserInvoices(req, res, next) {
    try {
        const userId = req.session.userId;
        const invoices = await Invoice.find({ customer: userId }).lean();
        req.session.user = { ...req.session.user, invoices: invoices }; // Explicitly set invoices

        next(); 
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error fetching invoices" });
    }
}

function renderHomePage(req, res) {
    res.render("home", { user: req.session.user });
}

async function updateUser(req, res) {
    const userId = req.session.userId;
    const { fullName, email } = req.body

    if (!fullName) {
        generalLogger.error("Unable to update user. name [" + fullName + "] is not valid")
        return res.status(400).send({ message: "Unable to update user: name cannot be empty" })
    }

    console.log(fullName)
    console.log(email)

    if (!email || typeof email !== "string" || !validateEmail(email)) {
        generalLogger.error("Unable to update user. Email [" + email + "] is not valid")
        return res.status(400).send({ message: "Unable to update user: email is invalid" })
    }

    try {
        if (req.file != undefined) {
            const picture = req.file.path
            const user_ = await User.findById(userId)
            const result = await cloudinary.uploader.upload(picture, { folder: user_.name })

            await User.findByIdAndUpdate(userId, {
                fullName,
                email,
                profilePicture: result.secure_url,
                cloudinary_id: result.public_id
            })
        }
        else {
            await User.findByIdAndUpdate(userId, {
                fullName,
                email
            })
        }

        generalLogger.info("user was updated successfully")
        return res.status(200).send({ message: "Success: user was updated successfully" })
    } catch (error) {
        if (error.codeName == "DuplicateKey") {
            generalLogger.error("Unable to update user. Email [" + email + "] is already being used")
            return res.status(400).send({ message: "Unable to update user: email is already being used" })
        } else {
            generalLogger.error("Error in updating user. Error: " + error)
            return res.status(400).send({ message: "Unable to update user" })
        }        
    }
}

module.exports = {
    getProfile,
    getUser,
    getUserAppointments,
    getUserInvoices,
    renderHomePage,
    updateUser
}