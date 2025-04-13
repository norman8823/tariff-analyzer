// services/newsService.js
require('dotenv').config();
const { EventRegistry, QueryArticlesIter, QueryItems, BaseQuery } = require('eventregistry');

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

      console.log('Fetching news with options:', options);

      // Create a more specific query
      const q = new QueryArticlesIter(this.er, {
        keywords: "tariffs OR trade tariffs OR import tariffs OR export tariffs OR customs duty",
        keywordsLoc: "title,body",  // Search in both title and body
        categoryUri: await this.er.getCategoryUri("Business"),  // Focus on business news
        lang: ["eng"],
        sortBy: sortBy,
        maxItems: pageSize,
        isDuplicateFilter: "skipDuplicates",  // Skip duplicate articles
        articleBodyLen: -1  // Get full article body
      });

      const articles = [];
      
      return new Promise((resolve) => {
        let articleCount = 0;
        
        q.execQuery((article) => {
          if (!article) {
            console.log(`Query complete. Found ${articleCount} articles`);
            resolve(articles);
            return;
          }

          // Check if the article is relevant to tariffs
          const isRelevant = this.isArticleRelevantToTariffs(article);
          
          if (article.lang === "eng" && isRelevant) {
            articleCount++;
            articles.push({
              title: article.title,
              description: article.body?.substring(0, 200) + "...",
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
              language: article.lang,
              relevanceScore: article.relevanceScore || 1
            });
            
            // If we've reached the pageSize limit, resolve
            if (articleCount >= pageSize) {
              console.log(`Reached article limit (${pageSize})`);
              resolve(articles);
            }
          }
        });

        // Set a timeout just in case
        setTimeout(() => {
          if (articles.length === 0) {
            console.log('Query timed out - no articles found');
            resolve([]);
          }
        }, 15000);
      });

    } catch (error) {
      console.error('News API error:', error);
      throw new Error('Failed to fetch news articles');
    }
  }

  /**
   * Check if an article is relevant to tariffs
   * @param {Object} article - The article to check
   * @returns {boolean} - True if the article is relevant
   */
  isArticleRelevantToTariffs(article) {
    const tariffKeywords = [
      'tariff', 'tariffs',
      'trade war', 'trade wars',
      'import duty', 'import duties',
      'export duty', 'export duties',
      'customs duty', 'customs duties',
      'trade barrier', 'trade barriers',
      'trade policy', 'trade policies',
      'trade restriction', 'trade restrictions'
    ];

    // Check title (higher weight)
    const titleMatch = tariffKeywords.some(keyword => 
      article.title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (titleMatch) return true;

    // Check body
    if (article.body) {
      const bodyText = article.body.toLowerCase();
      const keywordMatches = tariffKeywords.filter(keyword => 
        bodyText.includes(keyword.toLowerCase())
      );

      // Require at least two keyword matches in the body for relevance
      return keywordMatches.length >= 2;
    }

    return false;
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