import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-dark-card shadow-lg transition-colors duration-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Forum
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/chat"
              className="flex items-center space-x-2 text-gray-700 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="hidden sm:inline">Chat Rooms</span>
            </Link>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span>{user.username}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-1 border dark:border-dark-border">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/create-post"
                      className="block px-4 py-2 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Create Post
                    </Link>
                    <Link
                      to="/chat"
                      className="block px-4 py-2 text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Chat Rooms
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-500 dark:bg-dark-accent text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 