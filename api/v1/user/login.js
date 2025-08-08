const userModel = require('../../../Backend/Models/Usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Global connection variable
let isConnected = false;

// Database connection
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return;
  }

  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    throw new Error('MONGODB_URL is not defined');
  }

  console.log('Connecting to MongoDB...');

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 5
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    console.log('Login request received:', req.body);

    // Find user with timeout
    const myuser = await Promise.race([
      userModel.findOne({ email: req.body.email }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]);

    console.log('User found:', myuser ? 'Yes' : 'No');

    if (!myuser) {
      return res.status(200).json({ message: "User not found", success: false });
    }

    const ismatch = await bcrypt.compare(req.body.password, myuser.password);
    console.log('Password match:', ismatch);

    if (!ismatch) {
      return res.status(200).json({ message: "Password is incorrect", success: false });
    }

    const token = jwt.sign({ id: myuser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    console.log('Token generated successfully');

    res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        id: myuser._id,
        name: myuser.name,
        email: myuser.email
      },
      token: token
    });

  } catch (error) {
    console.error('Error in loginCtrl:', error);
    res.status(500).json({ message: "Error in login", success: false, error: error.message });
  }
}
