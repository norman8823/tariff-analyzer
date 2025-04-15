// services/newsService.js
require('dotenv').config();
const { EventRegistry, QueryArticlesIter } = require('eventregistry');

class NewsService {
  constructor() {
    this.er = new EventRegistry({
      apiKey: process.env.NEWS_API_KEY,
      allowUseOfArchive: true
    });
  }

  /**
   * Fetches recent tariff-related news articles
   * @param {Object} options - Search options
   * @param {string} options.keywords - Optional specific keywords to search for
   * @param {number} options.pageSize - Number of articles to fetch (default: 20)
   * @param {string} options.sortBy - Sorting criteria (default: 'date')
   * @returns {Promise<Array>} Array of news articles
   */
  async fetchTariffNews(options = {}) {
    try {
      const {
        keywords = 'tariffs',
        pageSize = 20,
        sortBy = 'date'
      } = options;

      // Get concept URI for the keyword
      const conceptUri = await this.er.getConceptUri(keywords);
      
      // Create query iterator
      const q = new QueryArticlesIter(this.er, {
        conceptUri: conceptUri,
        sortBy: sortBy,
        lang: ["eng"],  // Only English articles
        maxItems: pageSize
      });

      const articles = [];

      // Execute query and collect articles
      await new Promise((resolve) => {
        q.execQuery((article) => {
          if (article && article.lang === "eng") {  // Double-check language
            articles.push({
              title: article.title,
              description: article.body?.substring(0, 200) + "...",  // Create a description from body
              content: article.body,
              url: article.url,
              urlToImage: article.image,
              publishedAt: article.date,
              source: {
                id: article.source?.uri,
                name: article.source?.title || 'Unknown'
              },
              author: article.authors?.join(', ') || null,
              categories: article.categories || [],
              sentiment: article.sentiment,
              language: article.lang
            });
          }
          if (!article) {
            resolve();
          }
        });
      });

      return articles;

    } catch (error) {
      console.error('News API error:', error);
      throw new Error('Failed to fetch news articles');
    }
  }

  /**
   * Gets default date range for news search (last 48 hours)
   * @returns {{from: string, to: string}} Date range object with ISO date strings
   */
  getDefaultDateRange() {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setHours(today.getHours() - 48);
    
    return {
      from: twoDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  }
}

module.exports = new NewsService();