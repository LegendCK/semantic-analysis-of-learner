import React, { useState } from "react";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  onClear: () => void;
}

const QueryInput: React.FC<QueryInputProps> = ({ onSubmit, onClear }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <>
      <input
        type="text"
        placeholder="Ask a question about any topic you're learning..."
        className="w-full max-w-2xl p-4 rounded-lg bg-gray-900 text-white placeholder-gray-400 shadow-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={handleClear}
          className="bg-cyan-600 text-white px-5 py-2 rounded-md hover:bg-cyan-700 transition duration-200"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          className="bg-cyan-700 text-white px-5 py-2 rounded-md hover:bg-cyan-800 transition duration-200"
        >
          🔍 Analyze Query
        </button>
      </div>
    </>
  );
};

export default QueryInput;
