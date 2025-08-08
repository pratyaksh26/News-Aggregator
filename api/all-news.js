const axios = require('axios');

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
    // Check if API_KEY is available
    if (!process.env.API_KEY) {
      return res.status(500).json({
        success: false,
        error: "API_KEY environment variable is not set"
      });
    }

    let pageSize = parseInt(req.query.pageSize) || 80;
    let page = parseInt(req.query.page) || 1;
    let q = req.query.q || 'world'; // Default search query if none provided

    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
    const result = await makeApiRequest(url);

    res.status(result.status).json(result);
  } catch (error) {
    console.error('Error in all-news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
