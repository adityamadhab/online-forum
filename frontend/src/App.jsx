import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import axios from 'axios'
import Navbar from './components/Navbar'
import Home from './components/Home'
import CreatePost from './components/CreatePost'
import PostDetail from './components/PostDetail'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import ChatRooms from './components/ChatRooms'
import CreateRoom from './components/CreateRoom'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user data
      axios.get('http://localhost:3000/api/users/me', {
        headers: { 'x-auth-token': token }
      })
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          // If token is invalid, remove it
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg dark:text-dark-text transition-colors duration-200">
          <Navbar user={user} setUser={setUser} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/create-post" element={<CreatePost user={user} />} />
              <Route path="/post/:id" element={<PostDetail user={user} />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/chat" element={<ChatRooms user={user} />} />
              <Route path="/create-room" element={<CreateRoom />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
