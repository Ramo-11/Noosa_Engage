const User = require("../../models/User")
const PendingUser = require("../../models/PendingUser");
const bcrypt = require("bcrypt")
const { generalLogger } = require("../utils/generalLogger")
const { sendSignupEmail, sendSignupVerificationCodeEmail } = require("../mail")

function isAuthenticated(req, res, next) {
    if (req.session.userLoggedIn) {
        return next()
    }
    res.redirect("/login")
}

function renderSignUpPageIfNotFilled(req, res, next) {
    if (req.session.pendingSignup) {
        return next()
    }
    res.redirect("/signup")
}

function authenticateIsAdmin(req, res, next) {
    if (req.session.isUserAdmin) {
        return next()
    }
    res.redirect("/");
}

function renderUserHomePageIfAuthenticated(req, res, next) {
    if (req.session.userLoggedIn) {
        return res.redirect("/home");
    }
    next();
}

function renderLandingPageIfNotAuthenticated(req, res, next) {
    if (req.session.userLoggedIn) {
        return next()
    }
    res.redirect("/")
}

const logout = (req, res) => {
    const wasLoggedIn = req.session.userLoggedIn

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Could not log out" })
        }

        res.clearCookie('connect.sid')

        setTimeout(() => {
            res.redirect("/")
        }, 2000)
    })
}

async function loginUser(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        generalLogger.error("Error logging in: email or password missing")
        return res.status(400).send({ message: "Email or password are missing" })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            generalLogger.error("Error logging in: user not found")
            return res.status(401).send({ message: "User not found" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            generalLogger.error("Error logging in: incorrect password")
            return res.status(401).send({ message: "Incorrect password" })
        }

        req.session.userLoggedIn = true
        req.session.userId = user._id

        generalLogger.info("User logged in successfully")
        return res.status(200).send({ message: "Login successful! Redirecting to home screen..." })
    } catch (error) {
        generalLogger.error("Error logging in: ", error)
        return res.status(500).send({ message: "Internal server error" })
    }
}

async function signupUser(req, res) {
    const {fullName, email, password, confirmedPassword, honeypot, ts } = req.body

    const formTime = parseInt(ts);
    const now = Date.now();
    if (!formTime || now - formTime < 5000) {
        return res.status(200).send({ message: "Verification code sent to your email" });
    }

    if (honeypot) {
        generalLogger.warn("Signup bot detected via honeypot");
        return res.status(200).send({ message: "Verification code sent to your email" }); // fake OK
    }

    if (!fullName || !email || !password || !confirmedPassword) {        
        generalLogger.error("Sign-up failed: Missing required fields")
        return res.status(400).send({ message: "Error: All fields are required" })
    }

    if (password !== confirmedPassword) {
        generalLogger.error("Sign-up failed: Passwords do not match")
        return res.status(400).send({ message: "Error: Passwords do not match" })
    }

    try {
        const existingUser = await User.findOne({ email });
        const existingPending = await PendingUser.findOne({ email });

        if (existingUser || existingPending) {
            return res.status(400).send({ message: "Email already in use" });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes
        
        const pendingUser = new PendingUser({
            fullName,
            email,
            password,
            verificationCode,
            verificationExpires
        });

        await pendingUser.save();

        await sendSignupVerificationCodeEmail({ email, fullName, code: verificationCode });

        req.session.pendingSignup = {
            fullName,
            email,
            password,
            verificationCode
            };

        return res.status(200).json({ message: "Verification code sent to your email" });

    } catch (error) {
        generalLogger.error("Signup error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    logout,
    loginUser,
    signupUser,
    isAuthenticated,
    authenticateIsAdmin,
    renderUserHomePageIfAuthenticated,
    renderLandingPageIfNotAuthenticated,
    renderSignUpPageIfNotFilled
}
