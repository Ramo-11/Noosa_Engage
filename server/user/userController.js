const User = require("../../models/User");

const getProfile = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login")
    }

    try {
        const user = await User.findById(req.session.userId)
        if (!user) {
            return res.status(404).send("User not found")
        }

        res.render("dashboard/profile", { user })
    } catch (err) {
        return res.status(500).send("Internal server error")
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

module.exports = {
    getProfile,
    getUser
}