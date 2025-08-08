const userModel = require('../../../Backend/Models/Usermodel');
const bcrypt = require('bcryptjs');
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

    console.log('Register request received:', req.body);

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      console.log('User already exists:', req.body.email);
      return res.status(200).json({ message: 'User already exists', success: false });
    }

    // Hash the password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    // Create a new user
    const newUser = new userModel(req.body);
    await newUser.save();
    console.log('New user registered:', newUser);

    res.status(201).json({ message: 'Registered successfully', success: true });
  } catch (error) {
    console.error('Error in registerCtrl:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
