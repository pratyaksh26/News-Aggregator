const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  likedArticles: [{
    articleUrl: String,
    articleTitle: String,
    likedAt: { type: Date, default: Date.now }
  }],
  bookmarkedArticles: [{
    articleUrl: String,
    articleTitle: String,
    bookmarkedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;