import React, { useState, useEffect } from 'react';
import { Copy, Trash2, RefreshCw, Plus, Check, Clock, RotateCcw, Monitor, Activity } from 'lucide-react';
import { API_URL } from '../config';

const KeyManagement = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(10);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
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
  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/keys/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateKeys = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count, duration, notes })
      });
      if (response.ok) {
        setCount(10);
        setNotes('');
        await fetchKeys();
      }
    } catch (error) {
      console.error('Error generating keys:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteKey = async (keyId) => {
    if (!window.confirm('Möchtest du diesen Key wirklich löschen?')) return;
    try {
      const response = await fetch(`${API_URL}/keys/${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) await fetchKeys();
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const resetHwid = async (scriptKey) => {
    if (!window.confirm('HWID zurücksetzen? Der User kann danach auf einem anderen Gerät spielen.')) return;
    setResettingHwid(scriptKey);
    try {
      const response = await fetch(`${API_URL}/keys/script/reset-hwid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scriptKey })
      });
      if (response.ok) {
        await fetchKeys();
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

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">License Keys</h1>
        <p className="text-slate-400">Generiere und verwalte Lizenzschlüssel</p>
      </div>

      {/* Generation Form */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Neue Keys generieren</h3>
            <p className="text-xs text-slate-400">Erstelle neue Lizenzschlüssel</p>
          </div>
        </div>
        <form onSubmit={generateKeys} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">Anzahl</label>
              <input type="number" min="1" max="1000" value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">Dauer (Tage)</label>
              <input type="number" min="1" max="365" value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">Notizen</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional..." className="w-full px-4 py-2 rounded" />
            </div>
          </div>
          <button type="submit" disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {generating ? (
              <><div className="loading-spinner"></div>Wird generiert...</>
            ) : (
              <><Plus size={18} />{count} Key(s) generieren</>
            )}
          </button>
        </form>
      </div>

      {/* Keys Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Alle Keys</h3>
            <p className="text-xs text-slate-400 mt-1">Insgesamt {keys.length} Keys</p>
          </div>
          <button onClick={fetchKeys} disabled={loading} className="btn-icon hover:scale-110 transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="loading-spinner"></div>
              <p className="text-slate-400">Wird geladen...</p>
            </div>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-lg">Keine Keys gefunden</p>
            <p className="text-slate-500 text-sm mt-2">Generiere oben neue Lizenzschlüssel</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Discord</th>
                  <th>Schlüssel</th>
                  <th>Status</th>
                  <th>HWID</th>
                  <th>Nutzungen</th>
                  <th>Zuletzt aktiv</th>
                  <th>Gültig bis</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key._id}>
                    {/* Discord */}
                    <td>
                      {key.isRedeemed ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {(key.discordTag || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{key.discordTag || 'Unbekannt'}</p>
                            <code className="text-xs text-slate-500">{key.discordId || '-'}</code>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-500 text-xs">-</span>
                          </div>
                          <span className="text-slate-500 text-sm">Nicht eingelöst</span>
                        </div>
                      )}
                    </td>

                    {/* Schlüssel */}
                    <td>
                      <code className="text-xs bg-slate-900/50 px-2 py-1 rounded font-mono text-blue-300">
                        {key.key.substring(0, 12)}...
                      </code>
                    </td>

                    {/* Status */}
                    <td>
                      <div className="flex items-center gap-2">
                        {key.isRedeemed ? (
                          <><Check size={14} className="text-green-400" /><span className="badge badge-success">Eingelöst</span></>
                        ) : (
                          <><Clock size={14} className="text-yellow-400" /><span className="badge badge-warning">Verfügbar</span></>
                        )}
                      </div>
                    </td>

                    {/* HWID */}
                    <td>
                      {key.isRedeemed && key.hwidSet ? (
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-green-400 flex-shrink-0" />
                          <div className="flex items-center gap-1">
                            <code className="text-xs text-green-400 font-mono break-all">{key.hwid}</code>
                            <button
                              onClick={() => navigator.clipboard.writeText(key.hwid)}
                              className="btn-icon flex-shrink-0" title="Kopieren">
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                      ) : key.isRedeemed ? (
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400">Noch nicht ausgeführt</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>

                    {/* Nutzungen */}
                    <td>
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-300">{key.usageCount || 0}x</span>
                      </div>
                    </td>

                    {/* Zuletzt aktiv */}
                    <td className="text-sm text-slate-400">
                      {key.lastUsed
                        ? new Date(key.lastUsed).toLocaleDateString('de-DE')
                        : 'Nie'}
                    </td>

                    {/* Gültig bis */}
                    <td className="text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" />
                        {formatTimeRemaining(key.expiresAt)}
                      </div>
                    </td>

                    {/* Aktionen */}
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyKey(key.key)}
                          className={`btn-icon transition ${copied === key.key ? 'bg-green-600 text-white scale-110' : 'hover:scale-110'}`}
                          title="Key kopieren">
                          {copied === key.key ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        {key.isRedeemed && (
                          <button
                            onClick={() => resetHwid(key.key)}
                            disabled={resettingHwid === key.key}
                            className="btn-icon text-orange-400 hover:text-orange-300 hover:scale-110 transition"
                            title="HWID zurücksetzen">
                            <RotateCcw size={16} className={resettingHwid === key.key ? 'animate-spin' : ''} />
                          </button>
                        )}
                        <button onClick={() => deleteKey(key._id)}
                          className="btn-icon text-red-400 hover:text-red-300 hover:scale-110 transition"
                          title="Key löschen">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Total Keys</p>
              <p className="text-3xl font-bold text-white mt-2">{keys.length}</p></div>
            <div className="text-4xl">🔐</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Verfügbar</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{keys.filter(k => !k.isRedeemed).length}</p></div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-slate-400 text-sm">Eingelöst</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{keys.filter(k => k.isRedeemed).length}</p></div>
            <div className="text-4xl">✓</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
