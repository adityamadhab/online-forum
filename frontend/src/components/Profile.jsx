import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { UserCircleIcon, EnvelopeIcon, HeartIcon, BookmarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData(prev => ({
      ...prev,
      username: user.username,
      email: user.email
    }));
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'liked' || activeTab === 'bookmarked') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    setError('');
    try {
      const endpoint = activeTab === 'liked' ? '/users/me/liked-posts' : '/users/me/bookmarks';
      const response = await axios.get(endpoint);
      const posts = response.data;
      
      // Ensure we have all the necessary data populated
      const populatedPosts = await Promise.all(
        posts.map(async (post) => {
          if (!post.author.username) {
            const fullPost = await axios.get(`/posts/${post._id}`);
            return fullPost.data;
          }
          return post;
        })
      );

      if (activeTab === 'liked') {
        setLikedPosts(populatedPosts);
      } else {
        setBookmarkedPosts(populatedPosts);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords if trying to change password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('New passwords do not match');
        setIsLoading(false);
        return;
      }
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await axios.put('/users/profile', {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });

      setUser(response.data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPosts = (posts) => {
    if (isLoadingPosts) return <LoadingSpinner />;
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-dark-muted">
          {activeTab === 'liked' ? 'No liked posts yet' : 'No bookmarked posts yet'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link 
              to={`/post/${post._id}`}
              className="text-lg font-medium text-gray-900 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400"
            >
              {post.title}
            </Link>
            <p className="mt-2 text-gray-600 dark:text-dark-muted line-clamp-2">
              {post.content}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="text-gray-500 dark:text-dark-muted">
                Posted by {post.author?.username || 'Unknown'} • {format(new Date(post.createdAt), 'PPP')}
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-500 dark:text-dark-muted">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  {post.comments?.length || 0}
                </span>
                <span className="flex items-center text-gray-500 dark:text-dark-muted">
                  <HeartIcon className="h-5 w-5 mr-1" />
                  {post.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
        {/* Tab Navigation */}
        <div className="border-b dark:border-dark-border">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text'
                }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'liked'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text'
                }`}
            >
              <HeartIcon className="h-5 w-5 inline-block mr-1" />
              Liked Posts
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'bookmarked'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text'
                }`}
            >
              <BookmarkIcon className="h-5 w-5 inline-block mr-1" />
              Bookmarks
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'profile' ? (
            // Existing profile form
            <div>
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Profile Settings</h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                             hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-dark-muted" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border dark:border-dark-border rounded-lg
                                 bg-white dark:bg-dark-secondary
                                 text-gray-900 dark:text-dark-text
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent
                                 disabled:bg-gray-100 dark:disabled:bg-dark-hover
                                 disabled:cursor-not-allowed`}
                      />
                    </div>
                  </div>

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
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border dark:border-dark-border rounded-lg
                                 bg-white dark:bg-dark-secondary
                                 text-gray-900 dark:text-dark-text
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent
                                 disabled:bg-gray-100 dark:disabled:bg-dark-hover
                                 disabled:cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <div className="border-t dark:border-dark-border pt-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                          Change Password
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                                       bg-white dark:bg-dark-secondary
                                       text-gray-900 dark:text-dark-text
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                                       bg-white dark:bg-dark-secondary
                                       text-gray-900 dark:text-dark-text
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmNewPassword"
                              value={formData.confirmNewPassword}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border dark:border-dark-border rounded-lg
                                       bg-white dark:bg-dark-secondary
                                       text-gray-900 dark:text-dark-text
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`px-6 py-2 text-white rounded-lg
                                   ${isLoading 
                                     ? 'bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed' 
                                     : 'bg-blue-500 dark:bg-dark-accent hover:bg-blue-600 dark:hover:bg-blue-600'
                                   } transition-colors duration-200`}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          ) : activeTab === 'liked' ? (
            renderPosts(likedPosts)
          ) : (
            renderPosts(bookmarkedPosts)
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 