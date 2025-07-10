const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const Invoice = require("../../models/Invoice");
const { generalLogger } = require("../utils/generalLogger")
const validateEmail = require('../utils/emailValidator')
const cloudinary = require("../pictureHandlers/cloudinary")
const nodemailer = require("nodemailer");

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
    const { fullName, email, phoneNumber } = req.body;

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

    try {
        const updates = { fullName, email, phoneNumber };

        if (req.file != undefined) {
            const picture = req.file.path;
            const user_ = await User.findById(userId);
            const result = await cloudinary.uploader.upload(picture, { folder: user_.name });

            updates.profilePicture = result.secure_url;
            updates.cloudinary_id = result.public_id;
        }

        await User.findByIdAndUpdate(userId, updates);

        generalLogger.info("User was updated successfully");
        generalLogger.debug("Updated user details: " + JSON.stringify(updates));
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

async function forgotPassword(req, res) {
    const { email } = req.body;

    let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "noosa@noosaengage.com",
                pass: process.env.EMAIL_PASSWORD
            }
        })

    if (!email || typeof email !== "string" || !validateEmail(email)) {
        generalLogger.error("Forgot password failed: Invalid email [" + email + "]");
        return res.status(400).send({ message: "Please enter a valid email address" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            generalLogger.error("Forgot password failed: Email not found [" + email + "]");
            return res.status(404).send({ message: "No account found with this email address" });
        }

        // Generate reset token (6-digit code)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user with reset token
        await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: resetTokenExpiry
        });

        let emailDetails = {
            from: "noosa@noosaengage.com",
            to: email,
            subject: "Password Reset - Noosa Engage",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0A3755;">Password Reset Request</h2>
                    <p>Hello ${user.fullName},</p>
                    <p>We received a request to reset your password for your Noosa Engage account.</p>
                    <p>Your password reset code is:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #0A3755; font-size: 36px; margin: 0; letter-spacing: 4px;">${resetToken}</h1>
                    </div>
                    <p>This code will expire in 15 minutes for security purposes.</p>
                    <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
                    <hr style="border: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">
                        Best regards,<br>
                        The Noosa Engage Team
                    </p>
                </div>
            `
        };

        // Debug: Log email details
        generalLogger.info("Attempting to send email to: " + email);
        generalLogger.info("Email subject: " + emailDetails.subject);

        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(emailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send reset email: " + error);
                    generalLogger.error("Error details: " + JSON.stringify(error));
                    reject(error);
                } else {
                    generalLogger.info("Password reset email sent successfully!");
                    generalLogger.info("Email info: " + JSON.stringify(info));
                    generalLogger.info("Message ID: " + info.messageId);
                    resolve(info);
                }
            });
        });

        generalLogger.info("Password reset token generated for: " + email);
        return res.status(200).send({ 
            message: "Password reset instructions have been sent to your email address" 
        });
    } catch (error) {
        generalLogger.error("Error in forgot password: " + error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

module.exports = {
    getProfile,
    getUser,
    getUserData,
    renderHomePage,
    updateUser,
    forgotPassword
}