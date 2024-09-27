// server/sessionController.js
const User = require("../models/User"); // Ensure the path to your User model is correct
const bcrypt = require("bcrypt");
const { generalLogger } = require("../utils/generalLogger");
const { sendSignupEmail } = require("../server/mail");


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
        res.render("profile", { user }); // Assuming you have a profile.ejs file
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).send("Internal server error");
    }
};

const getDashboard = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }

    try {
        const user = await User.findById(req.session.userId).select('name email profilePicture'); // Select the fields you need
        if (!user) {
            return res.status(404).send("User not found"); // Handle user not found
        }

        console.log(user);
        res.render("dashboard", { user, currntRoute: 'dashboard' });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).send("Internal server error");
    }
};

const logout = (req, res) => {

    // Check if userLoggedIn exists before destroying the session
    const wasLoggedIn = req.session.userLoggedIn; 

    req.session.destroy(err => {
        if (err) {
            console.log("Logout error:", err);
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
    console.log("User logged in status before destruction:", wasLoggedIn);
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
            return res.status(401).render("login", { errorMessage: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            generalLogger.error("Error logging in: incorrect password");
            return res.status(401).render("login", { errorMessage: "Invalid email or password" });
        }

        // Set user session variables
        req.session.userLoggedIn = true;
        req.session.userId = user._id;

        generalLogger.info("User logged in successfully");
        return res.status(200).render("login", { successMessage: "Login successful! Redirecting to homepage..." });
    } catch (error) {
        generalLogger.error("Error logging in: ", error);
        return res.status(500).render("login", { errorMessage: "Internal server error" });
    }
}


const getUser = async (req) => {
    // Check if there is a session and user ID
    if (!req.session || !req.session.userId) {
        // Return a default user object if not logged in
        return {
            isLoggedIn: false,
            profilePicture: null, // Default value if no profile picture
            // Add other default properties as needed
        };
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return {
                isLoggedIn: false,
                profilePicture: null, // Default value if user is not found
            };
        }

        // Return user data with logged-in status
        return {
            isLoggedIn: true,
            profilePicture: user.profilePicture, // Include the user's profile picture
            // Add other user properties as needed
        };
    } catch (error) {
        console.error("Error fetching user data:", error);
        return {
            isLoggedIn: false,
            profilePicture: null, // Default value in case of error
        };
    }
};

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        generalLogger.info(`New user registered: ${email}`);

        sendSignupEmail(newUser);  // Send the welcome email after successful sign-up

        // Redirect to login after successful registration
        return res.redirect("/login");
    } catch (error) {
        generalLogger.error("Error registering user:", error);
        return res.status(500).send({ message: "Error: Internal server error" });
    }
}

// Exporting the functions
module.exports = {
    getProfile,
    logout,
    loginUser,
    getUser,
    getDashboard,
    signUpUser,
};