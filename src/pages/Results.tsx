import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Resource } from "../types";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { concept, resources } = location.state || {};

  if (!concept) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No query results found.</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-blue-500 underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Concept Matched: {concept}</h1>

      <h2 className="text-xl font-semibold mb-2">Microlearning Resources:</h2>
      <ul className="space-y-2">
        {resources.map((res: Resource) => (
          <li key={res.id} className="p-4 border rounded-md shadow-sm">
            <span className="font-semibold">{res.title}</span>
            <span className="ml-2 px-2 py-1 bg-gray-200 text-sm rounded">{res.type}</span>
            <div>
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View Resource
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
