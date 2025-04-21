// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  console.log('Auth status:', { isAuthenticated, user }); // Added for debugging
  
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Tariff Analyzer</Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* MVP Navigation */}
              <Link to="/analysis" className="hover:underline">
                Paste Analysis
              </Link>
              
              {/* Enhanced Version Navigation */}
              <Link to="/news-search" className="hover:underline">
                Tariff News
              </Link>
              
              {/* User Info & Logout */}
              <div className="flex items-center">
                <span className="text-sm mr-2">{user?.name}</span>
                <button 
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => loginWithRedirect()}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;