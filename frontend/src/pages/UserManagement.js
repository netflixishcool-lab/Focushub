import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Search, Clock, Monitor, RotateCcw, Activity } from 'lucide-react';
import { API_URL } from '../config';

const UserManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resettingHwid, setResettingHwid] = useState(null);
  const token = localStorage.getItem('token');

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '∞ Unbegrenzt';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    if (diff <= 0) return 'Abgelaufen';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 100) return 'Never';
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${expiry.toLocaleDateString('de-DE')} (${days}d ${hours}h ${minutes}m ${seconds}s)`;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLicenses(); }, []);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/keys/active-licenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setLicenses(data.licenses || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetHwid = async (scriptKey, discordTag) => {
    if (!window.confirm(`HWID für ${discordTag || scriptKey} zurücksetzen?\nDer User kann danach auf einem anderen Gerät spielen.`)) return;
    setResettingHwid(scriptKey);
    try {
      const response = await fetch(`${API_URL}/keys/script/reset-hwid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scriptKey })
      });
      if (response.ok) {
        await fetchLicenses();
      } else {
        const d = await response.json();
        alert(d.message || 'Fehler beim HWID-Reset');
      }
    } catch (error) {
      console.error('Error resetting HWID:', error);
    } finally {
      setResettingHwid(null);
    }
  };

  const revokeKey = async (scriptKey, discordTag) => {
    if (!window.confirm(`Lizenz von ${discordTag || scriptKey} widerrufen? Dies kann nicht rückgängig gemacht werden.`)) return;
    try {
      // Find the license key by scriptKey and delete it
      const listRes = await fetch(`${API_URL}/keys/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listRes.json();
      const keyRecord = listData.keys?.find(k => k.key === scriptKey);
      if (keyRecord) {
        await fetch(`${API_URL}/keys/${keyRecord._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchLicenses();
      }
    } catch (error) {
      console.error('Error revoking key:', error);
    }
  };

  const filtered = licenses.filter(l => {
    const term = searchTerm.toLowerCase();
    return (
      (l.discordTag || '').toLowerCase().includes(term) ||
      (l.discordId || '').includes(term) ||
      (l.scriptKey || '').toLowerCase().includes(term)
    );
  });

  const withHwid = licenses.filter(l => l.hwid).length;

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">Aktive Lizenzen</h1>
        <p className="text-slate-400">Alle Benutzer mit eingelösten Keys und HWID-Status</p>
      </div>

      {/* Controls */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Discord Tag, ID oder Key suchen..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10" />
          </div>
          <button onClick={fetchLicenses} disabled={loading}
            className="btn-icon hover:scale-110 transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Aktive Lizenzen</p>
              <p className="text-3xl font-bold text-white mt-2">{licenses.length}</p></div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">HWID Gesperrt</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{withHwid}</p></div>
            <div className="text-4xl">🔒</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Kein HWID</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{licenses.length - withHwid}</p></div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Lizenzinhaber ({filtered.length})</h3>
          <p className="text-xs text-slate-400 mt-1">HWID wird beim ersten Script-Start automatisch gesperrt</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="loading-spinner"></div>
              <p className="text-slate-400">Wird geladen...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-lg">Keine aktiven Lizenzen</p>
            <p className="text-slate-500 text-sm mt-2">Erstelle Keys und teile sie via Discord Bot</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Discord</th>
                  <th>Script Key</th>
                  <th>HWID</th>
                  <th>Nutzungen</th>
                  <th>Zuletzt aktiv</th>
                  <th>Gültig bis</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((license) => (
                  <tr key={license._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {(license.discordTag || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{license.discordTag || 'Unbekannt'}</p>
                          <code className="text-xs text-slate-500">{license.discordId || '-'}</code>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-xs bg-slate-900/50 px-2 py-1 rounded font-mono text-blue-300">
                        {license.scriptKey.substring(0, 10)}...
                      </code>
                    </td>
                    <td>
                      {license.hwid ? (
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-green-400" />
                          <code className="text-xs text-green-400 font-mono">{license.hwid}</code>
                          <span className="badge badge-success text-xs">Gesperrt</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400">Noch nicht gesetzt</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-300">{license.usageCount || 0}x</span>
                      </div>
                    </td>
                    <td className="text-sm text-slate-400">
                      {license.lastUsed
                        ? new Date(license.lastUsed).toLocaleDateString('de-DE')
                        : 'Nie'}
                    </td>
                    <td className="text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" />
                        {formatTimeRemaining(license.expiresAt)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {license.hwid && (
                          <button
                            onClick={() => resetHwid(license.scriptKey, license.discordTag)}
                            disabled={resettingHwid === license.scriptKey}
                            className="btn-icon text-orange-400 hover:text-orange-300 hover:scale-110 transition"
                            title="HWID zurücksetzen">
                            <RotateCcw size={16} className={resettingHwid === license.scriptKey ? 'animate-spin' : ''} />
                          </button>
                        )}
                        <button
                          onClick={() => revokeKey(license.scriptKey, license.discordTag)}
                          className="btn-icon text-red-400 hover:text-red-300 hover:scale-110 transition"
                          title="Lizenz widerrufen">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
