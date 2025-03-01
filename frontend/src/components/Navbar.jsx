import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Title */}
        <Link to="/" className="text-2xl font-bold tracking-wide hover:text-gray-200 transition">
          🚀 Serverless Blog
        </Link>

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-200 transition text-lg font-medium">
            Home
          </Link>
          <Link
            to="/create"
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            ✏️ Create Blog
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-blue-800 p-4 rounded-lg space-y-2">
          <Link
            to="/"
            className="block text-lg font-medium hover:text-gray-200 transition"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/create"
            className="block bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition w-full text-center"
            onClick={() => setIsOpen(false)}
          >
            ✏️ Create Blog
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
