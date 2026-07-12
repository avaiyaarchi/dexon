const mongoose = require('mongoose');

// Disable buffering so queries fail fast if DB is offline, avoiding hung requests
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Backend server running in OFFLINE mock-fallback mode.');
  }
};

module.exports = connectDB;
