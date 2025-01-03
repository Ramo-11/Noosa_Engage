const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const Invoice = require("../../models/Invoice");
const { generalLogger } = require("../utils/generalLogger")
const validateEmail = require('../utils/emailValidator')
const cloudinary = require("../pictureHandlers/cloudinary")
const bcrypt = require('bcrypt')

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
            isAdmin: user.isAdmin,
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
    const { fullName, email, phoneNumber, newPassword } = req.body;

    if (!fullName) {
        generalLogger.error("Unable to update user. name [" + fullName + "] is not valid");
        return res.status(400).send({ message: "Unable to update user: name cannot be empty" });
    }

    if (!email || typeof email !== "string" || !validateEmail(email)) {
        generalLogger.error("Unable to update user. Email [" + email + "] is not valid");
        return res.status(400).send({ message: "Unable to update user: email is invalid" });
    }

    if (!phoneNumber) {
        generalLogger.error("Unable to update user. phone number [" + phoneNumber + "] is not valid");
        return res.status(400).send({ message: "Unable to update user: phone number cannot be empty" });
    }

    if (newPassword && newPassword.trim() === "") {
        return res.status(400).send({ message: "Password cannot be empty" });
    }

    try {
        const updates = { fullName, email, phoneNumber };

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.password = hashedPassword;
        }

        if (req.file != undefined) {
            const picture = req.file.path;
            const user_ = await User.findById(userId);
            const result = await cloudinary.uploader.upload(picture, { folder: user_.name });

            updates.profilePicture = result.secure_url;
            updates.cloudinary_id = result.public_id;
        }

        await User.findByIdAndUpdate(userId, updates);

        generalLogger.info("User was updated successfully");
        return res.status(200).send({ message: "Success: user was updated successfully" });
    } catch (error) {
        if (error.codeName == "DuplicateKey") {
            generalLogger.error("Unable to update user. Email [" + email + "] is already being used");
            return res.status(400).send({ message: "Unable to update user: email is already being used" });
        } else {
            generalLogger.error("Error in updating user. Error: " + error);
            return res.status(400).send({ message: "Unable to update user" });
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