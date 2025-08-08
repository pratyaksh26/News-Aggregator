// API Configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000'
  },
  production: {
    // Use the same domain as the frontend for serverless deployment
    API_BASE_URL: process.env.REACT_APP_API_URL || window.location.origin
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/v1/user/login',
  REGISTER: '/api/v1/user/register',
  TEST: '/api/v1/user/test',

  // Article endpoints
  ARTICLE_DATA: '/api/v1/articles/data',
  ARTICLE_LIKE: '/api/v1/articles/like',
  ARTICLE_COMMENT: '/api/v1/articles/comment',
  ARTICLE_BOOKMARK: '/api/v1/articles/bookmark',

  // News endpoints
  ALL_NEWS: '/all-news',
  COUNTRY_NEWS: '/country',
  CATEGORY_NEWS: '/top-headlines'
};

export default API_BASE_URL;
