// routes/news.js - Enhanced Version
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// POST /api/fetch-news - Fetch news articles from News API
router.post('/fetch-news', checkJwt, async (req, res) => {
  try {
    const { keywords, fromDate, toDate } = req.body;
    const userId = req.auth.payload.sub;
    
    // Call to News API
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`;
    
    const newsResponse = await fetch(newsApiUrl);
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news');
    }
    
    const newsData = await newsResponse.json();
    
    // Extract relevant article info and filter for tariff-related content
    const articles = newsData.articles
      .filter(article => {
        // Only include articles likely to be about tariffs
        const content = (article.title + ' ' + article.description).toLowerCase();
        return content.includes('tariff') || 
               content.includes('trade') || 
               content.includes('import tax') ||
               content.includes('export tax') ||
               content.includes('trade war') ||
               content.includes('trade policy') ||
               content.includes('trade dispute') ||
               content.includes('customs duty');
      })
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        content: article.content // Note: News API typically provides truncated content
      }));
    
    res.json({ articles });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

module.exports = router;