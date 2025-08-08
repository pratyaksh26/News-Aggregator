require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const connectDB = require("./config/Db");

const app = express();

// CORS configuration - Allow all origins for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins for now
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());




// Health check endpoint (no database required)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check MongoDB URL format
app.get('/debug-mongo', (req, res) => {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    return res.json({ error: 'MONGODB_URL not set' });
  }

  // Show the connection string with sensitive parts masked
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':***@');

  res.json({
    originalLength: mongoUri.length,
    maskedUri: maskedUri,
    hasBufferMaxEntries: mongoUri.toLowerCase().includes('buffermaxentries'),
    hasBufferCommands: mongoUri.toLowerCase().includes('buffercommands')
  });
});

// Test MongoDB connection endpoint
app.get('/test-db-connection', async (req, res) => {
  try {
    const connectDB = require('./config/Db');
    await connectDB();
    res.json({
      success: true,
      message: 'Database connection successful!',
      connectionState: require('mongoose').connection.readyState,
      host: require('mongoose').connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      errorCode: error.code,
      errorName: error.name
    });
  }
});

// Middleware to ensure database connection for routes that need it
const ensureDBConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
};

// Apply DB connection middleware only to routes that need database
app.use('/api/v1/user', require("./Routes/UserRoutes"))
app.use('/api/v1/articles', ensureDBConnection, require("./Routes/ArticleRoutes"))
app.use('/', require("./Routes/NewsRoutes"))

// app.use(morgan('dev'))
















// Helper function for API requests
async function makeApiRequest(url) {
  try {
    const response = await axios.get(url);
    console.log("Fetched Data:", response.data);
    return {
      status: 200,
      success: true,
      message: "Successfully fetched the data",
      data: response.data,
    };
  } catch (error) {
    console.error("API request error:", error.response ? error.response.data : error);
    return {
      status: 500,
      success: false,
      message: "Failed to fetch data from the API",
      error: error.response ? error.response.data : error.message,
    };
  }
}

app.get("/all-news", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;
  let page = parseInt(req.query.page) || 1;
  let q = req.query.q || 'world'; // Default search query if none provided

  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);

  res.status(result.status).json(result);
});

app.get("/top-headlines", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;
  let page = parseInt(req.query.page) || 1;
  let category = req.query.category || "general";

  let url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

app.get("/country/:iso", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;
  let page = parseInt(req.query.page) || 1;
  const country = req.params.iso;

  let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.API_KEY}&page=${page}&pageSize=${pageSize}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

// Add a root route for API info
app.get('/', (req, res) => {
  res.json({
    message: 'NewsApp API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/user',
      articles: '/api/v1/articles',
      news: '/country/:iso, /top-headlines/:category, /all-news'
    }
  });
});

const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;