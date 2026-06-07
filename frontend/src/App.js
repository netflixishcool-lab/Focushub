import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KeyManagement from './pages/KeyManagement';
import UserManagement from './pages/UserManagement';
import ProjectManagement from './pages/ProjectManagement';
import Navbar from './components/Navbar';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Verify token
      const verifyToken = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      };
      verifyToken();
    }
  }, [token]);

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={(newToken) => {
            setToken(newToken);
            localStorage.setItem('token', newToken);
          }} />} />
        </Routes>
      </Router>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<div className="p-8 text-center text-red-600 font-bold">Zugriff verweigert!</div>} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {user?.isAdmin && (
          <Navbar user={user} onLogout={() => {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
          }} />
        )}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/keys" element={<KeyManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/projects" element={<ProjectManagement />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;