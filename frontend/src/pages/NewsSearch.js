// src/pages/NewsSearch.js
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const NewsSearch = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default to last 48 hours
  const getDefaultDates = () => {
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

  // Automatically fetch tariff news on component mount
  useEffect(() => {
    const fetchTariffNews = async () => {
      console.log('Sending request to:', `${process.env.REACT_APP_API_URL}/api/fetch-news`);
      setLoading(true);
      setError(null);

      try {
        const token = await getAccessTokenSilently();
        const dates = getDefaultDates();
        
        // Default search for tariff-related economic news (last 48 hours)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetch-news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            keywords: 'tariffs trade economic policy',
            fromDate: dates.from,
            toDate: dates.to
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tariff news');
        }

        const data = await response.json();
        console.log('Received articles:', data.articles);
        setArticles(data.articles || []);
        
        if (data.articles?.length === 0) {
          setError('No tariff news articles found in the last 48 hours.');
        }
      } catch (error) {
        console.error('News fetch error:', error);
        setError(error.message || 'Failed to fetch tariff news articles');
      } finally {
        setLoading(false);
      }
    };

    fetchTariffNews();
  }, [getAccessTokenSilently]);

  // Handle article selection
  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  // Handle analyze button click
  const handleAnalyzeArticle = async () => {
    if (!selectedArticle) return;
    
    setAnalyzeLoading(true);
    setError(null);
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: `${getSourceName(selectedArticle)}: ${new Date(selectedArticle.publishedAt).toLocaleDateString()}`,
          text: selectedArticle.content || selectedArticle.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze article');
      }

      const data = await response.json();
      
      // Navigate to the analysis detail page with the result
      navigate(`/analysis/${data.analysisId}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze article');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Helper to safely get source name from different formats
  const getSourceName = (article) => {
    if (!article) return 'Unknown Source';
    
    // Handle both object format and string format
    if (article.source) {
      if (typeof article.source === 'string') {
        return article.source;
      } else if (article.source.name) {
        return article.source.name;
      }
    }
    
    return 'Unknown Source';
  };

  // Format the published date
  // eslint-disable-next-line no-unused-vars
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate time ago for articles
  const getTimeAgo = (publishDate) => {
    if (!publishDate) return 'Unknown time';
    
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Recent Tariff News</h1>
      <p className="text-gray-600 mb-6">Showing tariff and trade policy news from the last 48 hours</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <Loading />
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Latest Articles ({articles.length})</h2>
          <p className="text-gray-600 mb-4">Select an article to analyze its tariff implications and market sentiment.</p>
          
          <div className="bg-white shadow rounded overflow-hidden">
            {articles.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">No tariff news articles found in the last 48 hours.</p>
                <p className="mt-2 text-sm text-gray-500">Try again later or use the paste analysis tool instead.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {articles.map((article, index) => (
                  <li 
                    key={index}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedArticle === article ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleArticleSelect(article)}
                  >
                    <h3 className="font-medium text-lg text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getSourceName(article)} • {getTimeAgo(article.publishedAt)}
                    </p>
                    <p className="text-sm mt-2 text-gray-700">{article.description}</p>
                    
                    <div className="mt-2 text-xs">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()} // Prevent click from selecting the article
                      >
                        Read original article
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {selectedArticle && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Selected: {selectedArticle.title}</p>
            <p className="text-sm text-gray-600">{getSourceName(selectedArticle)}</p>
          </div>
          
          <button
            onClick={handleAnalyzeArticle}
            disabled={analyzeLoading}
            className={`px-4 py-2 rounded text-white ${
              analyzeLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {analyzeLoading ? 'Analyzing...' : 'Analyze Selected Article'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsSearch;