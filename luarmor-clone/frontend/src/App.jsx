import React, { useEffect } from 'react';
import { useAuthStore } from './store.js';
import Navigation from './components/Navigation.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import Login from './components/pages/Login.jsx';
import Register from './components/pages/Register.jsx';
import Admin from './components/pages/Admin.jsx';
import Profile from './components/pages/Profile.jsx';

export default function App() {
  const { user, verify } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  useEffect(() => {
    verify().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-luarmor-darker">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-luarmor-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {currentPage === 'login' ? (
          <Login onRegisterClick={() => setCurrentPage('register')} />
        ) : (
          <Register onLoginClick={() => setCurrentPage('login')} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-luarmor-darker">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
      />
      <div className="pt-20">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'admin' && user.is_admin && <Admin />}
        {currentPage === 'profile' && <Profile />}
      </div>
    </div>
  );
}
