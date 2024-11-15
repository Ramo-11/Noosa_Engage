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
            isAdmin: null,
        };
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return {
                isLoggedIn: false,
                user: null,
                isAdmin: null,
            };
        }

        return {
            isLoggedIn: true,
            isAdmin: user.isAdmin, // Ensure this field exists in the database
            user: user,
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            isLoggedIn: false,
            user: null,
            isAdmin: null,
        };
    }
}


async function getUserData(req, res, next) {
    try {
        const userId = req.session.userId

        const [user, appointments, invoices] = await Promise.all([
            User.findById(userId).select("fullName email profilePicture").lean(),
            Appointment.find({ customer: userId }).lean(),
            Invoice.find({ customer: userId }).lean()
        ])
        req.session.user = {
            ...req.session.user,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            appointments: appointments,
            invoices: invoices
        }
        
        next()
    } catch (error) {
        console.error("Error fetching user data:", error)
        return res.status(500).send({ message: "Error fetching user data" })
    }
}

function renderHomePage(req, res) {
    res.render("home", { user: req.session.user })
}

async function updateUser(req, res) {
    const userId = req.session.userId;
    const { fullName, email } = req.body

    if (!fullName) {
        generalLogger.error("Unable to update user. name [" + fullName + "] is not valid")
        return res.status(400).send({ message: "Unable to update user: name cannot be empty" })
    }

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
    getUserData,
    renderHomePage,
    updateUser
}