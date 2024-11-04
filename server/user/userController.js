const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const Invoice = require("../../models/Invoice");


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

module.exports = {
    getProfile,
    getUser,
    getUserAppointments,
    getUserInvoices,
    renderHomePage
}