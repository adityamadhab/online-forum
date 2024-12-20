import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

function CreateRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/rooms', formData);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-text">
          Create Discussion Room
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Room Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                       bg-white dark:bg-dark-secondary
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                       bg-white dark:bg-dark-secondary
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                       bg-white dark:bg-dark-secondary
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-lg
                     ${isLoading 
                       ? 'bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed' 
                       : 'bg-blue-500 dark:bg-dark-accent hover:bg-blue-600 dark:hover:bg-blue-600'
                     } transition-colors duration-200`}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom; 