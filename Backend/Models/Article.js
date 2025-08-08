const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  source: String,
  author: String,
  publishedAt: String,
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: { type: Date, default: Date.now }
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    text: String,
    commentedAt: { type: Date, default: Date.now }
  }],
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
