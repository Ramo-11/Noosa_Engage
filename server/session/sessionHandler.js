const User = require("../../models/User")
const bcrypt = require("bcrypt")
const { generalLogger } = require("../utils/generalLogger")
const { sendSignupEmail } = require("../mail")

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
        generalLogger.error("Error logging in: one or more fields are missing")
        return res.status(400).render("login", { errorMessage: "All fields must be completed" })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            generalLogger.error("Error logging in: user not found")
            return res.status(401).render("login", { errorMessage: "Invalid email" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            generalLogger.error("Error logging in: incorrect password")
            return res.status(401).render("login", { errorMessage: "Invalid password" })
        }

        req.session.userLoggedIn = true
        req.session.userId = user._id

        generalLogger.info("User logged in successfully")
        return res.status(200).render("login", { successMessage: "Login successful! Redirecting to dashboard..." })
    } catch (error) {
        generalLogger.error("Error logging in: ", error)
        return res.status(500).render("login", { errorMessage: "Internal server error" })
    }
}

async function signupUser(req, res) {
    const { firstName, lastName, email, password, confirmPassword } = req.body

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        generalLogger.error("Sign-up failed: Missing required fields")
        return res.status(400).send({ message: "Error: All fields are required" })
    }

    if (password !== confirmPassword) {
        generalLogger.error("Sign-up failed: Passwords do not match")
        return res.status(400).send({ message: "Error: Passwords do not match" })
    }

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            generalLogger.error("Sign-up failed: Email already in use")
            return res.render('signup', { errorMessage: "Error: Email already in use" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        await newUser.save()

        generalLogger.info(`New user registered: ${email}`)
        sendSignupEmail(newUser)
        return res.redirect("/login")
    } catch (error) {
        generalLogger.error("Error registering user:", error)
        return res.render('signup', { errorMessage: "Error: Internal server error" })
    }
}

module.exports = {
    logout,
    loginUser,
    signupUser,
}
