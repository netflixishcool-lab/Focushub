import React from 'react';
import { useAuthStore } from '../store.js';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navigation({ currentPage, onNavigate }) {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-luarmor-dark border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-luarmor-primary rounded-lg"></div>
          <h1 className="text-xl font-bold">Luarmor</h1>
        </div>

        <button 
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 absolute md:relative top-full md:top-0 left-0 md:left-auto right-0 md:right-auto w-full md:w-auto bg-luarmor-dark md:bg-transparent border-b md:border-0 border-gray-800 md:border-0 p-4 md:p-0`}>
          <button
            onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg ${currentPage === 'dashboard' ? 'bg-luarmor-primary' : 'hover:bg-luarmor-dark'}`}
          >
            Dashboard
          </button>

          {user?.is_admin && (
            <button
              onClick={() => { onNavigate('admin'); setMenuOpen(false); }}
              className={`px-4 py-2 rounded-lg ${currentPage === 'admin' ? 'bg-luarmor-primary' : 'hover:bg-luarmor-dark'}`}
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => { onNavigate('profile'); setMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg ${currentPage === 'profile' ? 'bg-luarmor-primary' : 'hover:bg-luarmor-dark'}`}
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg hover:bg-luarmor-danger/20 flex items-center gap-2 text-luarmor-danger"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
