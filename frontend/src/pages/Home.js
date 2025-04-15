// src/pages/Home.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Tariff News Analyzer</h1>
        <p className="text-xl text-gray-600 mb-8">
          Quickly process tariff news, summarize key details, and analyze potential market impacts
        </p>
        
        {isAuthenticated ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* MVP Feature */}
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-3">Paste Analysis</h2>
                <p className="mb-4 text-gray-600">
                  Paste a news article about tariffs to get an AI-generated summary and sentiment analysis.
                </p>
                <Link 
                  to="/analysis" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start New Analysis
                </Link>
              </div>
              
              {/* Enhanced Feature */}
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-3">Recent Tariff News</h2>
                <p className="mb-4 text-gray-600">
                  Browse and analyze recent news articles about tariffs and trade policies.
                </p>
                <Link 
                  to="/news-search" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Browse News
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-bold mb-3">Analysis History</h2>
              <p className="mb-4 text-gray-600">
                View your previous tariff news analyses and insights.
              </p>
              <Link 
                to="/history" 
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                View History
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="mb-6 text-gray-600">
              Log in to access the Tariff News Analyzer and start analyzing trade policy impacts.
            </p>
            <button 
              onClick={() => loginWithRedirect()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Log In / Sign Up
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-blue-600 text-2xl font-bold mb-2">1</div>
            <h3 className="font-bold mb-2">Input Tariff News</h3>
            <p className="text-gray-600">Paste news text or select from recent tariff-related articles.</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <div className="text-blue-600 text-2xl font-bold mb-2">2</div>
            <h3 className="font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our AI extracts key information and analyzes potential market impacts.</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <div className="text-blue-600 text-2xl font-bold mb-2">3</div>
            <h3 className="font-bold mb-2">Get Insights</h3>
            <p className="text-gray-600">Review the structured summary and sentiment outlook to inform your research.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;