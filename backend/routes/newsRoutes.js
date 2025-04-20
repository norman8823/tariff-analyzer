// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const newsService = require('../services/newsService');

// Path for storing news data
const NEWS_CACHE_PATH = path.join(__dirname, '../data/news-cache.json');

// Ensure the data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(NEWS_CACHE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Get cached news or fetch new ones
router.get('/news', async (req, res) => {
  try {
    const { refresh } = req.query;
    let newsData;

    // Try to read from cache first (if refresh is not requested)
    if (!refresh) {
      try {
        const cacheContent = await fs.readFile(NEWS_CACHE_PATH, 'utf-8');
        newsData = JSON.parse(cacheContent);
        
        // Check if cache is less than 1 hour old
        const cacheAge = Date.now() - newsData.lastUpdated;
        if (cacheAge < 3600000) { // 1 hour in milliseconds
          console.log('Returning cached news data:', JSON.stringify(newsData, null, 2));
          return res.json(newsData);
        }
      } catch (err) {
        console.log('Cache miss or invalid cache, fetching new data');
      }
    }

    // Fetch fresh news data
    console.log('Fetching fresh news data...');
    const articles = await newsService.fetchTariffNews({
      pageSize: 20,
      sortBy: 'date'
    });

    console.log('Received articles:', JSON.stringify(articles, null, 2));

    newsData = {
      articles,
      lastUpdated: Date.now()
    };

    // Save to cache
    await ensureDataDir();
    await fs.writeFile(NEWS_CACHE_PATH, JSON.stringify(newsData, null, 2));

    res.json(newsData);
  } catch (error) {
    console.error('Error in /news endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Force refresh the news cache
router.post('/news/refresh', async (req, res) => {
  try {
    const articles = await newsService.fetchTariffNews({
      pageSize: 20,
      sortBy: 'date'
    });

    const newsData = {
      articles,
      lastUpdated: Date.now()
    };

    // Save to cache
    await ensureDataDir();
    await fs.writeFile(NEWS_CACHE_PATH, JSON.stringify(newsData, null, 2));

    res.json(newsData);
  } catch (error) {
    console.error('Error in /news/refresh endpoint:', error);
    res.status(500).json({ error: 'Failed to refresh news articles' });
  }
});

module.exports = router;
