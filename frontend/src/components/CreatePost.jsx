import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreatePost({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [error, setError] = useState('');
  const categories = ['General', 'Technology', 'Gaming', 'Sports', 'Movies', 'Music', 'Books'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/posts', formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-text">Create New Post</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-dark-text mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border dark:border-dark-border rounded-lg 
                       bg-white dark:bg-dark-secondary 
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:focus:ring-dark-accent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-dark-text mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border dark:border-dark-border rounded-lg 
                       bg-white dark:bg-dark-secondary 
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:focus:ring-dark-accent"
            >
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-dark-text mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-3 border dark:border-dark-border rounded-lg 
                       bg-white dark:bg-dark-secondary 
                       text-gray-900 dark:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:focus:ring-dark-accent
                       h-40 resize-y"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 dark:bg-dark-accent text-white 
                       rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 
                       transition-colors duration-200"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost; 