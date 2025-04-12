// services/newsService.js - Enhanced Version

/**
 * Fetches tariff-related news from the News API
 * @param {string} keywords - Search keywords
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchTariffNews = async (keywords, fromDate, toDate) => {
    try {
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
      
      return articles;
    } catch (error) {
      console.error('News API error:', error);
      throw new Error('Failed to fetch news articles');
    }
  };
  
  /**
   * Gets default date range for news search (last 48 hours)
   * @returns {{from: string, to: string}} Date range object with ISO date strings
   */
  const getDefaultDateRange = () => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(today.getHours() - 48);
    
    // Format as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    return {
      from: formatDate(twoDaysAgo),
      to: formatDate(today)
    };
  };
  
  module.exports = {
    fetchTariffNews,
    getDefaultDateRange
  };