// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <div className="h-2 w-24 bg-blue-600 mx-auto my-4"></div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-600">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
        </div>
        
        <Link to="/">
          <Button variant="primary" size="large">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
