const mongoose = require('mongoose');

// Test database connection endpoint
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check if environment variable exists
    if (!process.env.MONGODB_URL) {
      return res.status(500).json({
        success: false,
        error: 'MONGODB_URL environment variable is not set',
        hasEnvVar: false
      });
    }

    console.log('Testing MongoDB connection...');
    console.log('MongoDB URL exists:', !!process.env.MONGODB_URL);
    console.log('MongoDB URL length:', process.env.MONGODB_URL.length);

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Test connection with detailed error handling
    const mongoUri = process.env.MONGODB_URL;

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 1
    });

    console.log('MongoDB connection successful');

    // Test a simple operation
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();

    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      connectionState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
      pingResult: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorName: error.name,
      hasEnvVar: !!process.env.MONGODB_URL,
      timestamp: new Date().toISOString()
    });
  }
}
