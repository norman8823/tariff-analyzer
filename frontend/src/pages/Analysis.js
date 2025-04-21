// src/pages/Analysis.js
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const Analysis = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, text })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tariff News Analysis</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        {/* Form fields remain the same */}
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 font-medium">
            Source/Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Reuters: March 25, 2025"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="text" className="block mb-2 font-medium">
            News Text
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded h-60"
            placeholder="Paste the full text of the news article here..."
            required
          />
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !text}
            className={`px-4 py-2 rounded text-white ${
              loading || !text ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Tariff News'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setText('');
              setTitle('');
              setAnalysis(null);
              setError(null);
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {analysis && (
        <div className="bg-white shadow rounded p-6">
          {/* New simplified display using either analysis or tariffSummary field */}
          <div className="prose max-w-none">
            <ReactMarkdown>{analysis.analysis || analysis.tariffSummary}</ReactMarkdown>
          </div>
          
          <div className="flex justify-between mt-8">

            
            <button
              onClick={() => {
                setText('');
                setTitle('');
                setAnalysis(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Analysis
            </button>
          </div>
          
          {/* The disclaimer is now part of the Gemini output */}
        </div>
      )}
    </div>
  );
};

export default Analysis;