import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/history";
import type { Resource } from "../types";

const QueryInput = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const historyStore = useHistoryStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);

    // Simulated API response delay
    setTimeout(() => {
      const concept = "Recursion"; // mock concept
      const matchedResources: Resource[] = [
        {
          id: "1",
          title: "Recursion Explained Simply",
          url: "https://www.example.com/video",
          type: "video",
        },
        {
          id: "2",
          title: "10 Recursion Problems Solved",
          url: "https://www.example.com/article",
          type: "article",
        },
      ];

      // Add to history store
      historyStore.addToHistory({ question: input, matchedConcept: concept });

      // Navigate to results
      navigate("/results", {
        state: {
          concept,
          resources: matchedResources,
        },
      });

      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Enter Your Query
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. I don’t understand recursion"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Submit"}
        </button>
        {isLoading && (
          <div className="text-blue-600 text-sm mt-2 animate-pulse">
            Please wait, understanding your query...
          </div>
        )}
      </form>
    </div>
  );
};

export default QueryInput;
