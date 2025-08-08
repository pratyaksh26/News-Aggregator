// Debug endpoint to check environment variables
export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV,
    hasMongoUrl: !!process.env.MONGODB_URL,
    hasApiKey: !!process.env.API_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    mongoUrlLength: process.env.MONGODB_URL ? process.env.MONGODB_URL.length : 0,
    // Don't expose actual values for security
    mongoUrlStart: process.env.MONGODB_URL ? process.env.MONGODB_URL.substring(0, 20) + '...' : 'NOT_SET',
    timestamp: new Date().toISOString()
  });
}
