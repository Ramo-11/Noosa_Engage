const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generalLogger } = require('../utils/generalLogger');
const { sendSignupEmail } = require("../server/mail");  // Import the email function

async function signUpUser(req, res) {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        generalLogger.error("Sign-up failed: Missing required fields");
        return res.status(400).send({ message: "Error: All fields are required" });
    }

    if (password !== confirmPassword) {
        generalLogger.error("Sign-up failed: Passwords do not match");
        return res.status(400).send({ message: "Error: Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            generalLogger.error("Sign-up failed: Email already in use");
            return res.status(400).send({ message: "Error: Email already in use" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();
        generalLogger.info(`New user registered: ${email}`);

        // Send a welcome email to the new user
        sendSignupEmail(newUser);  // Send the welcome email after successful sign-up

        // Redirect to login after successful registration
        return res.redirect("/login");
    } catch (error) {
        generalLogger.error("Error registering user:", error);
        return res.status(500).send({ message: "Error: Internal server error" });
    }
}

module.exports = signUpUser;
