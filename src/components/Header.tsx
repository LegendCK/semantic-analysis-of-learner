import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <nav className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Semantic Learning</h1>
        <div className="space-x-4">
          <Link
            to="/"
            className={`hover:underline ${location.pathname === "/" ? "underline font-semibold" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/history"
            className={`hover:underline ${location.pathname === "/history" ? "underline font-semibold" : ""}`}
          >
            History
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
