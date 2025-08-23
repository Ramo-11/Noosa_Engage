const mongoose = require('mongoose');
const User = require('../models/PendingUser'); // adjust path as needed

if (process.env.NODE_ENV !== "production") {
        process.env.MONGODB_URI = process.env.MONGODB_URI_DEV
    } else {
        process.env.MONGODB_URI = process.env.MONGODB_URI_PROD
    }

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function deleteSpamUsers() {
  try {
    const result = await User.deleteMany({ fullName: /Lira/i });
    console.log(`Deleted ${result.deletedCount} spam users.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

deleteSpamUsers();
