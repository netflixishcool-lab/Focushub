import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Key, Users, LogOut, Home } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Übersicht' },
    { path: '/keys', icon: Key, label: 'Key Management', desc: 'Lizenzen' },
    { path: '/users', icon: Users, label: 'Benutzerverwaltung', desc: 'Benutzer' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 h-screen flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">🎯</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FocusHub</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110'} style={{ transition: 'transform 0.3s' }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
                {active && <div className="w-1 h-6 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700/50 space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Angemeldet als</p>
              <p className="font-bold text-white truncate">{user?.username}</p>
            </div>
          </div>
          {user?.isAdmin && (
            <div className="inline-block px-2 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded text-xs font-semibold text-white">
              👑 Admin
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center border-t border-slate-700/50">
        <p className="text-xs text-slate-500">v1.0.0 • FocusHub Admin</p>
      </div>
    </div>
  );
};

export default Sidebar;