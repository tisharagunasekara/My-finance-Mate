import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Import the AuthContext to access the user

interface NavItem {
  label: string;
  href: string;
}

const mainNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext); // Get user from context to check if the user is logged in

  // Only display the "Sign In" and "Sign Up" if the user is not logged in
  const authNavItems: NavItem[] = user
    ? [] // If the user is logged in, hide the auth links
    : [
        { label: "Sign In", href: "/login" },
        { label: "Sign Up", href: "/register" },
      ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-gray-800">
              Finance Mate
            </a>
          </div>
          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:space-x-8">
            {mainNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-gray-800"
              >
                {item.label}
              </a>
            ))}
            {authNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-gray-800"
              >
                {item.label}
              </a>
            ))}
          </div>
          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {[...mainNavItems, ...authNavItems].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 bg-indigo-50 text-base font-medium text-indigo-700"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
