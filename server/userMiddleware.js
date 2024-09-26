const { getUser } = require('./sessionControler'); // Adjusted to the same folder

const userMiddleware = async (req, res, next) => {
    res.locals.user = await getUser(req); // Retrieve user data and attach it to res.locals
    next(); // Call the next middleware or route handler
};

module.exports = userMiddleware;