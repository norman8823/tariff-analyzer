// src/pages/LoginTest.js
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginTest = () => {
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout, 
    user, 
    error, 
    isLoading, 
    getAccessTokenSilently 
  } = useAuth0();

  useEffect(() => {
    console.log('Auth0 State:', { isAuthenticated, isLoading, user, error });
  }, [isAuthenticated, isLoading, user, error]);

  const testApiCall = async () => {
    try {
      if (!isAuthenticated) {
        console.log('Not authenticated, cannot make API call');
        return;
      }

      console.log('Attempting to get token...');
      const token = await getAccessTokenSilently();
      console.log('Token received:', token ? 'Token exists' : 'No token');

      console.log('Attempting API call...');
      const response = await fetch('http://localhost:5000/api/test-auth', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('API response:', data);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading auth state...</div>;
  }

  if (error) {
    return <div>Authentication Error: {error.message}</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Auth0 Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Authentication Status:</h2>
        <p className="mt-2">
          {isAuthenticated ? (
            <span className="text-green-600 font-bold">Authenticated</span>
          ) : (
            <span className="text-red-600 font-bold">Not Authenticated</span>
          )}
        </p>
      </div>

      {isAuthenticated && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">User Info:</h2>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        ) : (
          <>
            <button
              onClick={testApiCall}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test API Call
            </button>
            
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginTest;