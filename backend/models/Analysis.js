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
  analysis: {     
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add a text index for potential search functionality
analysisSchema.index({ inputText: 'text', title: 'text', analysis: 'text' });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;