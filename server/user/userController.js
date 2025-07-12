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

    try {
        if (phoneNumber == undefined || phoneNumber == "") {
            generalLogger.debug("Phone number is not provided, setting it to undefined");
            const updates = { fullName, email, phoneNumber: undefined };
        } else {
            const updates = { fullName, email, phoneNumber };
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
            name: "NoosaEngage",
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
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Password Reset</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #ffffff;
                            color: #333333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .code-box {
                            background-color: #f4f4f4;
                            padding: 20px;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .code-box h1 {
                            color: #0A3755;
                            font-size: 36px;
                            margin: 0;
                            letter-spacing: 4px;
                        }
                        .footer {
                            color: #666666;
                            font-size: 14px;
                            margin-top: 30px;
                            border-top: 1px solid #eeeeee;
                            padding-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 style="color: #0A3755;">Password Reset Request</h2>
                        <p>Hello ${user.fullName},</p>
                        <p>We received a request to reset your password for your Noosa Engage account.</p>
                        <p>Your password reset code is:</p>
                        <div class="code-box">
                            <h1>${resetToken}</h1>
                        </div>
                        <p>This code will expire in 15 minutes for security purposes.</p>
                        <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
                        <div class="footer">
                            <p>
                                Best regards,<br>
                                The Noosa Engage Team
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };


        generalLogger.debug("Attempting to send forgot password email to: " + email);

        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(emailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send reset email: " + error);
                    generalLogger.error("Error details: " + JSON.stringify(error));
                    reject(error);
                } else {
                    generalLogger.info("Password reset email sent successfully!");
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

async function resetPassword(req, res) {
    const { email, resetCode, newPassword } = req.body;

    // Validate inputs
    if (!email || typeof email !== "string" || !validateEmail(email)) {
        generalLogger.error("Reset password failed: Invalid email [" + email + "]");
        return res.status(400).send({ message: "Invalid email address" });
    }

    if (!resetCode || typeof resetCode !== "string" || resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
        generalLogger.error("Reset password failed: Invalid reset code [" + resetCode + "]");
        return res.status(400).send({ message: "Invalid reset code. Please enter a 6-digit code" });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        generalLogger.error("Reset password failed: Invalid password length");
        return res.status(400).send({ message: "Password must be at least 6 characters long" });
    }

    try {
        // Find user with matching email and reset token
        const user = await User.findOne({ 
            email,
            passwordResetToken: resetCode,
            passwordResetExpires: { $gt: Date.now() } // Check if token hasn't expired
        });

        if (!user) {
            generalLogger.error("Reset password failed: Invalid or expired reset code for email [" + email + "]");
            return res.status(400).send({ message: "Invalid or expired reset code. Please request a new password reset" });
        }

        // Update user password and clear reset token fields
        await User.findByIdAndUpdate(user._id, {
            password: newPassword, // Assuming your User model has password hashing middleware
            passwordResetToken: undefined,
            passwordResetExpires: undefined
        });

        generalLogger.info("Password reset successful for email: " + email);
        return res.status(200).send({ 
            message: "Password reset successful! You can now log in with your new password" 
        });

    } catch (error) {
        generalLogger.error("Error in reset password: " + error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

module.exports = {
    getProfile,
    getUser,
    getUserData,
    renderHomePage,
    updateUser,
    forgotPassword,
    resetPassword
}