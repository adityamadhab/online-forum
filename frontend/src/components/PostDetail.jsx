import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function PostDetail({ user }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3000/api/comments',
        { content: comment, postId: id },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setPost({
        ...post,
        comments: [...post.comments, response.data],
      });
      setComment('');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:3000/api/comments/${commentId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setPost({
        ...post,
        comments: post.comments.filter(c => c._id !== commentId)
      });
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!post) return <div className="text-center py-4">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
        <div className="text-sm text-gray-500">
          Posted by {post.author.username} on {format(new Date(post.createdAt), 'PPP')}
        </div>
      </div>

      {user && (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Post Comment
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Comments ({post.comments.length})
        </h2>
        {post.comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          post.comments.map(comment => (
            <div key={comment._id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-600 whitespace-pre-wrap">{comment.content}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {comment.author.username} • {format(new Date(comment.createdAt), 'PPP')}
                </div>
                {user && (user.id === comment.author._id) && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PostDetail; 