import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, RefreshCw, Search, Clock, Mail } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tick, setTick] = useState(0);
  const token = localStorage.getItem('token');

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '∞ Unbegrenzt';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Abgelaufen';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Wenn > 100 Tage, dann "never" anzeigen
    if (days > 100) {
      return 'Never';
    }
    
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${expiry.toLocaleDateString('de-DE')} (${days}d ${hours}h ${minutes}m ${seconds}s)`;
  };

  // Live-Timer - aktualisiert jede Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId, username) => {
    if (!window.confirm(`Bist du sicher, dass du ${username} entfernen möchtest? Seine Keys werden revoked.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const displayName = user.discordTag || user.username;
    const matchesSearch = 
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.discordId && user.discordId.includes(searchTerm));
    
    return matchesSearch;
  });



  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage and administer all system users</p>
      </div>

      {/* Controls Card */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nach Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>

          {/* Filter */}
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="md:w-40"
          >
            <option value="all">Alle Benutzer</option>
          </select>

          {/* Refresh */}
          <button 
            onClick={fetchUsers} 
            disabled={loading}
            className="btn-icon hover:scale-110 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Aktive Users</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{users.length}</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>

        </div>

      {/* Users Table */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Benutzer ({filteredUsers.length})</h3>
          <p className="text-xs text-slate-400 mt-1">Klicke auf einen Benutzer für Optionen</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="loading-spinner"></div>
              <p className="text-slate-400">Wird geladen...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-lg">No users found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Verfällsdatum</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {(user.discordTag || user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.discordTag || user.username}</p>
                          {user.isAdmin && (
                            <span className="badge badge-primary text-xs">Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={14} className="text-slate-500" />
                        <code className="text-xs">{user.email}</code>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={14} className="text-slate-500" />
                        {formatTimeRemaining(user.expiresAt)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => removeUser(user._id, user.discordTag || user.username)}
                        className="btn-sm btn-danger transition"
                      >
                        <Trash2 size={16} className="inline mr-2" />
                        Entfernen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;