const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // exit process with failure
  }
};

module.exports = connectDB;
