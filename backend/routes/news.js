// routes/news.js
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const NewsService = require('../services/newsService');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// POST /api/fetch-news - Fetch news articles
router.post('/fetch-news', checkJwt, async (req, res) => {
  try {
    const { keywords, fromDate, toDate } = req.body;
    
    const articles = await NewsService.fetchTariffNews({
      keywords: keywords || 'tariffs trade economic policy',
      pageSize: 20,
      sortBy: 'date'
    });

    res.json({ articles });
  } catch (error) {
    console.error('News route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news articles', 
      message: error.message 
    });
  }
});

module.exports = router;