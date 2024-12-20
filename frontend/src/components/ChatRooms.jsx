import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

function ChatRooms({ user }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch available rooms
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/rooms');
        setRooms(response.data);
      } catch (err) {
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Socket event handlers
    socketRef.current.on('room-joined', (room) => {
      setMessages(room.messages);
    });

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = async (roomId) => {
    if (activeRoom) {
      socketRef.current.emit('leave-room', activeRoom._id);
    }
    
    try {
      const response = await axios.get(`/rooms/${roomId}`);
      setActiveRoom(response.data);
      socketRef.current.emit('join-room', roomId);
    } catch (err) {
      setError('Failed to join room');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    socketRef.current.emit('send-message', {
      roomId: activeRoom._id,
      content: newMessage
    });

    setNewMessage('');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Rooms List */}
        <div className="md:col-span-1 bg-white dark:bg-dark-card rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-dark-text">
            Discussion Rooms
          </h2>
          <Link
            to="/create-room"
            className="block w-full text-center mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 transition-colors"
          >
            Create Room
          </Link>
          <div className="space-y-2">
            {rooms.map(room => (
              <button
                key={room._id}
                onClick={() => handleJoinRoom(room._id)}
                className={`w-full text-left p-3 rounded-lg transition-colors
                  ${activeRoom?._id === room._id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text'
                  }`}
              >
                <div className="font-medium">{room.name}</div>
                <div className="text-sm opacity-75">{room.topic}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 bg-white dark:bg-dark-card rounded-lg shadow-md">
          {activeRoom ? (
            <div className="h-[600px] flex flex-col">
              {/* Room Header */}
              <div className="p-4 border-b dark:border-dark-border">
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">
                  {activeRoom.name}
                </h3>
                <p className="text-gray-600 dark:text-dark-muted">
                  {activeRoom.description}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.user === user._id || message.user._id === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.user === user._id || message.user._id === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-secondary text-gray-900 dark:text-dark-text'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.user.username || user.username}
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {format(new Date(message.createdAt), 'p')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-dark-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border dark:border-dark-border rounded-lg
                             bg-white dark:bg-dark-secondary
                             text-gray-900 dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg
                             hover:bg-blue-600 disabled:opacity-50
                             disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-500 dark:text-dark-muted">
              Select a room to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRooms; 