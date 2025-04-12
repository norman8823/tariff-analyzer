// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import AnalysisHistory from './pages/AnalysisHistory';
import AnalysisDetail from './pages/AnalysisDetail';
import NewsSearch from './pages/NewsSearch';

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Protected routes - MVP */}
            <Route path="/analysis" element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <AnalysisHistory />
              </ProtectedRoute>
            } />
            <Route path="/analysis/:id" element={
              <ProtectedRoute>
                <AnalysisDetail />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - Enhanced version */}
            <Route path="/news-search" element={
              <ProtectedRoute>
                <NewsSearch />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <footer className="bg-gray-100 py-6 mt-12">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} Tariff Analyzer Tool</p>
            <p className="mt-2">
              <strong>Disclaimer:</strong> Analysis provided is for informational purposes only.
              Not financial advice. Verify information and consult qualified professionals.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;