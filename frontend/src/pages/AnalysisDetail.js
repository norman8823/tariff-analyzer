// src/pages/AnalysisDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import ReactMarkdown from 'react-markdown';
import Loading from '../components/Loading';

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analyses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Analysis not found');
          }
          throw new Error('Failed to fetch analysis');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setError(error.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [id, getAccessTokenSilently]);
  
  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleNewAnalysis = () => {
    navigate('/analysis');
  };
  
  const handleBackToHistory = () => {
    navigate('/history');
  };
  
  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Analysis Detail</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleBackToHistory}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to History
          </button>
          <button
            onClick={handleNewAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Analysis
          </button>
        </div>
      </div>
    );
  }
  
  if (!analysis) return null;
  
  // Get the analysis content from either analysis field or tariffSummary (for compatibility)
  const analysisContent = analysis.analysis || analysis.tariffSummary;
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analysis Detail</h1>
      
      <div className="bg-white shadow rounded p-6 mb-8">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{analysis.title || 'Untitled Analysis'}</h2>
          <p className="text-sm text-gray-600 mt-1">Analyzed on {formatDate(analysis.timestamp)}</p>
        </div>
        
        <div className="prose max-w-none mb-6">
          <ReactMarkdown>{analysisContent}</ReactMarkdown>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">Original Text</h3>
          <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 max-h-96 overflow-y-auto">
            {analysis.inputText}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handleBackToHistory}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to History
        </button>
        
        <button
          onClick={handleNewAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Analysis
        </button>
      </div>
    </div>
  );
};

export default AnalysisDetail;