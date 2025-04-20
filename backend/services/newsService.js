// services/newsService.js
require('dotenv').config();
const { EventRegistry, QueryArticles, RequestArticleInfo } = require('eventregistry');

class NewsService {
  constructor() {
    this.er = new EventRegistry({
      apiKey: process.env.EVENT_REGISTRY_API_KEY,
      allowUseOfArchive: true,
      verboseOutput: true, // Enable for debugging
      logging: true
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

      // Get the date range (last 48 hours)
      const dateRange = this.getDefaultDateRange();
      
      // Create a direct query using the structure from the API documentation
      const q = new QueryArticles({
        action: "getArticles",
        keyword: keywords || "tariffs OR trade tariffs OR import tariffs OR export tariffs OR customs duty",
        keywordOper: "or",
        dateStart: dateRange.from,
        dateEnd: dateRange.to,
        articlesPage: 1,
        articlesCount: pageSize,
        articlesSortBy: sortBy === 'date' ? 'date' : 'rel',
        articlesSortByAsc: false,
        dataType: ["news", "blog"],
        lang: "eng",
        
        // Include article details we need
        resultType: "articles",
        includeArticleImage: true,
        includeArticleVideos: false,
        includeArticleLinks: true,
        includeArticleSocialScore: true,
        includeArticleDetails: true
      });

      // Execute the query
      console.log('Executing EventRegistry query...');
      const response = await this.er.execQuery(q);
      console.log(`Query executed, received response with status: ${response ? 'success' : 'failed'}`);
      
      if (!response || !response.articles || !response.articles.results) {
        console.log('No articles found in response');
        return [];
      }
      
      console.log(`Found ${response.articles.results.length} articles in raw response`);
      
      // Process and filter the articles
      const articles = response.articles.results
        .filter(article => this.isArticleRelevantToTariffs(article))
        .map(article => ({
          title: article.title,
          description: article.body ? (article.body.substring(0, 200) + "...") : article.title,
          content: article.body || article.title,
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.date,
          source: {
            id: article.source?.uri,
            name: article.source?.title || 'Unknown'
          },
          author: article.authors?.join(', ') || null,
          sentiment: article.sentiment
        }));
      
      console.log(`Returning ${articles.length} relevant articles after filtering`);
      return articles;

    } catch (error) {
      console.error('EventRegistry API error:', error);
      throw new Error(`Failed to fetch news articles: ${error.message}`);
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
    const titleText = article.title.toLowerCase();
    const titleMatch = tariffKeywords.some(keyword => 
      titleText.includes(keyword.toLowerCase())
    );

    if (titleMatch) return true;

    // Check body
    if (article.body) {
      const bodyText = article.body.toLowerCase();
      const keywordMatches = tariffKeywords.filter(keyword => 
        bodyText.includes(keyword.toLowerCase())
      );

      // Require at least one keyword match in the body for relevance
      return keywordMatches.length >= 1;
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
    
    // Format as YYYY-MM-DD for EventRegistry
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    return {
      from: formatDate(twoDaysAgo),
      to: formatDate(today)
    };
  }
}

module.exports = new NewsService();