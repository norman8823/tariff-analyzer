// models/Analysis.js
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Analysis'
  },
  inputText: {
    type: String,
    required: true
  },
  tariffSummary: {
    type: String,
    required: true
  },
  sentimentOutlook: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add a text index for potential search functionality
analysisSchema.index({ inputText: 'text', title: 'text' });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;