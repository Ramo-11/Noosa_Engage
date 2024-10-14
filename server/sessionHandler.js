// server/sessionController.js

//#region Imports
const User = require("../models/User"); // Ensure the path to your User model is correct
const bcrypt = require("bcrypt");
const { generalLogger } = require("../utils/generalLogger");
const { sendSignupEmail } = require("./mail");
const Invoice = require('../models/invoice'); // Import the Invoice model
//#endregion

//#region Methods
const getProfile = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found"); // Handle user not found
        }

        // Render the profile page with the user data
        res.render("dashboard/profile", { user }); // Assuming you have a profile.ejs file
    } catch (err) {
        return res.status(500).send("Internal server error");
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming you have user authentication in place
        const updatedData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            school: req.body.school,
            grade: req.body.grade,
            subjects: req.body.subjects,
            learningStyle: req.body.learningStyle,
            goals: req.body.goals,
            learningChallenges: req.body.learningChallenges
        };

        // Update the user in the database
        await User.findByIdAndUpdate(userId, updatedData, { new: true });
        
        // Redirect or respond with a success message
        res.redirect('/dashboard/profile'); // Redirect to the profile page after update
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const getDashboard = async (req, res) => {
    // Check if there is a session and user ID
    if (!req.session || !req.session.userId) {
        return res.redirect("/login");
    }

    try {
        // Fetch the entire user data
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Fetch all invoices for the user and sort by date in descending order
        const invoices = await Invoice.find({ customer: user._id }).sort({ createdAt: -1 }); // Assuming 'createdAt' is the field for invoice date

        // Get only the most recent invoice
        const recentInvoice = invoices.length > 0 ? invoices[0] : null;

        // Log the user object for debugging

        // Render the dashboard and pass the entire user object
        res.render("dashboard", {
            user: user.toObject(), // Convert Mongoose model to a plain JS object
            invoice: recentInvoice, // Passing only the most recent invoice
            currentRoute: 'dashboard'
        });
    } catch (err) {
        console.error("Error fetching invoices:", err);
        return res.status(500).send("Internal server error");
    }
};



const logout = (req, res) => {

    // Check if userLoggedIn exists before destroying the session
    const wasLoggedIn = req.session.userLoggedIn; 

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Could not log out" });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');

        setTimeout(() => {
            // Redirect to the home page after the delay
            res.redirect("/");
        }, 2000); // Delay for 2000 milliseconds (2 seconds)
    });

    // Log the previous userLoggedIn status
};

async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        generalLogger.error("Error logging in: one or more fields are missing");
        return res.status(400).render("login", { errorMessage: "All fields must be completed" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            generalLogger.error("Error logging in: user not found");
            return res.status(401).render("login", { errorMessage: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            generalLogger.error("Error logging in: incorrect password");
            return res.status(401).render("login", { errorMessage: "Invalid password" });
        }

        // Set user session variables
        req.session.userLoggedIn = true;
        req.session.userId = user._id;

        generalLogger.info("User logged in successfully");
        return res.status(200).render("login", { successMessage: "Login successful! Redirecting to dashboard..." });
    } catch (error) {
        generalLogger.error("Error logging in: ", error);
        return res.status(500).render("login", { errorMessage: "Internal server error" });
    }
}


const getUser = async (req) => {
    if (!req.session || !req.session.userId) {
        return {
            isLoggedIn: false,
            user: null,
        };
    }

    try {
        const user = await User.findById(req.session.userId); 
        if (!user) {
            return {
                isLoggedIn: false,
                user: null,
            };
        }

        return {
            isLoggedIn: true,
            user: user,
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return {
            isLoggedIn: false,
            user: null,
        };
    }
};



async function signUpUser(req, res) {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Check for missing required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        generalLogger.error("Sign-up failed: Missing required fields");
        return res.render('signup', { errorMessage: "Error: All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        generalLogger.error("Sign-up failed: Passwords do not match");
        return res.render('signup', { errorMessage: "Error: Passwords do not match" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            generalLogger.error("Sign-up failed: Email already in use");
            return res.render('signup', { errorMessage: "Error: Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();
        generalLogger.info(`New user registered: ${email}`);

        // Send the welcome email after successful sign-up
        sendSignupEmail(newUser);

        // Redirect to login after successful registration
        return res.redirect("/login");
    } catch (error) {
        generalLogger.error("Error registering user:", error);
        return res.render('signup', { errorMessage: "Error: Internal server error" });
    }
}
//#endregion

//#region Exports
module.exports = {
    getProfile,
    logout,
    loginUser,
    getUser,
    getDashboard,
    signUpUser,
    updateProfile,
};
//#endregion