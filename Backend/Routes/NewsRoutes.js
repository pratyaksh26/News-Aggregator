const express = require('express');
const { getCountryNews, getCategoryNews, getAllNews } = require('../Controller/NewsController');

const router = express.Router();

// Route for country news
router.get('/country/:iso', getCountryNews);

// Route for category news  
router.get('/top-headlines/:category', getCategoryNews);

// Route for all news
router.get('/all-news', getAllNews);

module.exports = router;
