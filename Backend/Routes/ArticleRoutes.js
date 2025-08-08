const express = require('express');
const Article = require('../Models/Article');
const User = require('../Models/Usermodel');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get or create article
const getOrCreateArticle = async (articleData) => {
  let article = await Article.findOne({ url: articleData.url });

  if (!article) {
    article = new Article(articleData);
    await article.save();
  }

  return article;
};

// Like/Unlike article
router.post('/like', verifyToken, async (req, res) => {
  try {
    const { url, title, description, imageUrl, source, author, publishedAt } = req.body;
    const userId = req.userId;

    const article = await getOrCreateArticle({
      url, title, description, imageUrl, source, author, publishedAt
    });

    const existingLike = article.likes.find(like => like.userId.toString() === userId);

    if (existingLike) {
      // Unlike
      article.likes = article.likes.filter(like => like.userId.toString() !== userId);
      article.likeCount = Math.max(0, article.likeCount - 1);

      // Remove from user's liked articles
      await User.findByIdAndUpdate(userId, {
        $pull: { likedArticles: { articleUrl: url } }
      });

      await article.save();
      res.json({ success: true, liked: false, likeCount: article.likeCount });
    } else {
      // Like
      article.likes.push({ userId });
      article.likeCount += 1;

      // Add to user's liked articles
      await User.findByIdAndUpdate(userId, {
        $push: { likedArticles: { articleUrl: url, articleTitle: title } }
      });

      await article.save();
      res.json({ success: true, liked: true, likeCount: article.likeCount });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, message: 'Error processing like' });
  }
});

// Add comment
router.post('/comment', verifyToken, async (req, res) => {
  try {
    const { url, title, description, imageUrl, source, author, publishedAt, text } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const article = await getOrCreateArticle({
      url, title, description, imageUrl, source, author, publishedAt
    });

    article.comments.push({
      userId,
      userName: user.name,
      text
    });
    article.commentCount += 1;

    await article.save();

    res.json({
      success: true,
      comment: {
        userName: user.name,
        text,
        commentedAt: new Date()
      },
      commentCount: article.commentCount
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

// Get article data (likes, comments)
router.get('/data/:encodedUrl', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.encodedUrl);

    // Find article without aggressive timeout
    const article = await Article.findOne({ url }).populate('likes.userId', 'name');

    if (!article) {
      return res.json({
        success: true,
        likeCount: 0,
        commentCount: 0,
        comments: [],
        userLiked: false
      });
    }

    let userId = null;
    try {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        userId = decoded.id;
      }
    } catch (jwtError) {
      // Invalid token, continue without user ID
      console.log('Invalid JWT token:', jwtError.message);
    }

    const userLiked = userId ? article.likes.some(like => like.userId._id.toString() === userId) : false;

    res.json({
      success: true,
      likeCount: article.likeCount,
      commentCount: article.commentCount,
      comments: article.comments,
      userLiked
    });
  } catch (error) {
    console.error('Get article data error:', error);
    // Return default values instead of error when database fails
    res.json({
      success: true,
      likeCount: 0,
      commentCount: 0,
      comments: [],
      userLiked: false
    });
  }
});

// Bookmark/Unbookmark article
router.post('/bookmark', verifyToken, async (req, res) => {
  try {
    const { url, title } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const existingBookmark = user.bookmarkedArticles.find(bookmark => bookmark.articleUrl === url);

    if (existingBookmark) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedArticles: { articleUrl: url } }
      });
      res.json({ success: true, bookmarked: false });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, {
        $push: { bookmarkedArticles: { articleUrl: url, articleTitle: title } }
      });
      res.json({ success: true, bookmarked: true });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ success: false, message: 'Error processing bookmark' });
  }
});

module.exports = router;
