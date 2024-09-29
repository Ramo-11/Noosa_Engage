
const userStatusMiddleware = (req, res, next) => {
    res.locals.userLoggedIn = req.session.userId ? true : false; // Check if the user is logged in
    next(); // Proceed to the next middleware/route handler
};

module.exports = userStatusMiddleware;
