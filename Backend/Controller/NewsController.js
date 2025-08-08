const axios = require('axios');

// Get news by country
const getCountryNews = async (req, res) => {
  try {
    const { iso } = req.params;
    const { page = 1, pageSize = 6 } = req.query;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'API key not configured'
      });
    }

    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: iso,
        page: page,
        pageSize: pageSize,
        apiKey: apiKey
      }
    });

    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults
      }
    });

  } catch (error) {
    console.error('Error fetching country news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

// Get news by category
const getCategoryNews = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, pageSize = 6 } = req.query;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'API key not configured'
      });
    }

    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: category,
        country: 'us', // default country
        page: page,
        pageSize: pageSize,
        apiKey: apiKey
      }
    });

    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults
      }
    });

  } catch (error) {
    console.error('Error fetching category news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

// Get all news
const getAllNews = async (req, res) => {
  try {
    const { page = 1, pageSize = 6 } = req.query;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'API key not configured'
      });
    }

    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: 'us', // default country
        page: page,
        pageSize: pageSize,
        apiKey: apiKey
      }
    });

    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults
      }
    });

  } catch (error) {
    console.error('Error fetching all news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

module.exports = {
  getCountryNews,
  getCategoryNews,
  getAllNews
};
