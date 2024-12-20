import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/users/login', formData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text">Welcome back</h2>
            <p className="mt-2 text-gray-600 dark:text-dark-muted">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-dark-muted" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border dark:border-dark-border rounded-lg
                           bg-white dark:bg-dark-secondary
                           text-gray-900 dark:text-dark-text
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent
                           placeholder-gray-400 dark:placeholder-dark-muted"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-dark-muted" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border dark:border-dark-border rounded-lg
                           bg-white dark:bg-dark-secondary
                           text-gray-900 dark:text-dark-text
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent
                           placeholder-gray-400 dark:placeholder-dark-muted"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold
                         ${isLoading 
                           ? 'bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed' 
                           : 'bg-blue-500 dark:bg-dark-accent hover:bg-blue-600 dark:hover:bg-blue-600'
                         } transition-colors duration-200`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-dark-muted">
                Don't have an account?{' '}
              </span>
              <Link 
                to="/register" 
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login; 