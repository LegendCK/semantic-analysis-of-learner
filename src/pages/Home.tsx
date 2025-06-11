import React from "react";
import QueryInput from "../components/QueryInput";

const Home = () => {
  const sampleQueries = [
   ""
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black py-4 flex justify-between items-center px-6 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">ConceptBridge</h1>
          <p className="text-sm text-gray-300">Semantic Learning Assistant</p>
        </div>
        <div className="flex gap-8">
          <nav className="flex space-x-4">
            <a href="#" className="text-white hover:text-cyan-400 px-3 py-2 rounded bg-cyan-600">Home</a>
            <a href="#" className="text-white hover:text-cyan-400">Dashboard</a>
            <a href="#" className="text-white hover:text-cyan-400">About</a>
          </nav>
          <div className="text-gray-300 flex items-center gap-2">
            <span className="material-icons text-purple-400">account_circle</span> Student
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-cyan-600 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">Ask Your Learning Question</h2>
        <div className="w-full max-w-2xl">
          <QueryInput />
        </div>
      </section>

      {/* Suggestions */}
      <div className="flex flex-col items-center mt-8 gap-3 px-4">
        {sampleQueries.map((query, idx) => (
          <div
            key={idx}
            className="bg-gray-900 px-6 py-3 rounded-lg w-full max-w-2xl hover:bg-gray-800 transition"
          >
            {query}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
