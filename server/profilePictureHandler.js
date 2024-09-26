// server/profilePictureHandler.js
const multer = require('multer');
const User = require('../models/User'); // Assuming the User model is in models folder

// Multer memory storage configuration (store images in memory)
const storage = multer.memoryStorage();

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
});

// Profile picture handler function
const profilePictureHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Update the user's profile picture
    user.profilePicture = {
      data: req.file.buffer, // Save the image buffer
      contentType: req.file.mimetype // Save the content type
    };

    // Save the updated user document
    await user.save();

    // Send a response
    res.json({ message: 'Profile picture uploaded successfully!' });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  upload,
  profilePictureHandler,
};
