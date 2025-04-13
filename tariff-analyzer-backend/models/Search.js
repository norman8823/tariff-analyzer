// models/Search.js
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  keywords: {
    type: String,
    required: true
  },
  dateRange: {
    from: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional field to store selected article for a search
  selectedArticle: {
    title: String,
    description: String,
    url: String,
    source: String,
    publishedAt: Date,
    content: String
  }
});

// Add text index for search keywords
searchSchema.index({ keywords: 'text' });

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;