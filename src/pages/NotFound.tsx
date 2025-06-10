import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-blue-500 underline">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
