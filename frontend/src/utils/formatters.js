// src/utils/formatters.js - Utility functions for both MVP and Enhanced versions

/**
 * Formats a date with standard options
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  /**
   * Calculates relative time (e.g., "2 hours ago")
   * @param {string|Date} publishDate - Date to calculate from
   * @returns {string} Human-readable relative time
   */
  export const getTimeAgo = (publishDate) => {
    const now = new Date();
    const publishedDate = new Date(publishDate);
    const diffMs = now - publishedDate;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  /**
   * Truncates text to a specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  /**
   * Extracts sentiment class from sentiment analysis
   * @param {string} sentimentOutlook - The sentiment outlook text
   * @returns {string} CSS class based on sentiment
   */
  export const getSentimentClass = (sentimentOutlook) => {
    if (!sentimentOutlook) return 'bg-gray-100';
    
    const text = sentimentOutlook.toLowerCase();
    
    if (text.includes('positive')) return 'bg-green-50 border-l-4 border-green-500';
    if (text.includes('negative')) return 'bg-red-50 border-l-4 border-red-500';
    if (text.includes('neutral')) return 'bg-blue-50 border-l-4 border-blue-500';
    if (text.includes('mixed') || text.includes('uncertain')) 
      return 'bg-yellow-50 border-l-4 border-yellow-500';
    
    return 'bg-gray-100';
  };