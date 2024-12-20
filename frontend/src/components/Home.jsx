import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import { ChatBubbleLeftIcon, HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

function Home({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const categories = ['All', 'Technology', 'Gaming', 'Sports', 'Movies', 'Music', 'Books'];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/posts');
        setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [likedResponse, bookmarkedResponse] = await Promise.all([
          axios.get('/users/me/liked-posts'),
          axios.get('/users/me/bookmarks')
        ]);
        
        setLikedPosts(new Set(likedResponse.data.map(post => post._id)));
        setBookmarkedPosts(new Set(bookmarkedResponse.data.map(post => post._id)));
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLike = async (postId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (likedPosts.has(postId)) {
        await axios.delete(`/posts/${postId}/like`);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likes: post.likes.filter(id => id !== user._id) }
            : post
        ));
      } else {
        await axios.post(`/posts/${postId}/like`);
        setLikedPosts(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likes: [...post.likes, user._id] }
            : post
        ));
      }
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  const handleBookmark = async (postId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (bookmarkedPosts.has(postId)) {
        await axios.delete(`/users/bookmarks/${postId}`);
        setBookmarkedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await axios.post(`/users/bookmarks/${postId}`);
        setBookmarkedPosts(prev => new Set([...prev, postId]));
      }
    } catch (err) {
      console.error('Failed to bookmark/unbookmark post:', err);
    }
  };

  const filteredPosts = posts
    .filter(post => 
      (category === 'all' || post.category === category) &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'mostComments') return b.comments.length - a.comments.length;
      if (sortBy === 'mostLiked') return (likedPosts.has(b._id) ? 1 : 0) - (likedPosts.has(a._id) ? 1 : 0);
      return 0;
    });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">
          Welcome to the Forum
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join the discussion, share your thoughts, and connect with others.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow dark:bg-gray-800 dark:border-gray-700 dark:text-dark-text"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-dark-text"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostComments">Most Comments</option>
            <option value="mostLiked">Most Liked</option>
          </select>
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {view === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat.toLowerCase())}
              className={`px-3 py-1 rounded-full text-sm ${
                category === cat.toLowerCase()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:opacity-80 transition-opacity`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Section */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No posts found</div>
      ) : (
        <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <Link to={`/post/${post._id}`} className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmark(post._id)}
                    className="text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    {bookmarkedPosts.has(post._id) ? (
                      <BookmarkIconSolid className="h-5 w-5 text-blue-500" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>
              
              <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    {post.comments?.length || 0}
                  </span>
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    {likedPosts.has(post._id) ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button
                    onClick={() => handleBookmark(post._id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    {bookmarkedPosts.has(post._id) ? (
                      <BookmarkIconSolid className="h-5 w-5 text-blue-500" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span>Posted by {post.author.username}</span>
                  <span>{format(new Date(post.createdAt), 'PPP')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home; 