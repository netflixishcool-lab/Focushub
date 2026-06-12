import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Code, Check, X } from 'lucide-react';
import { API_URL } from '../config';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', scriptContent: '', category: 'Tool' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { loadProjects(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/scripts/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.scriptContent) {
      setMessage('❌ Name und Script-Inhalt sind Pflichtfelder');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/scripts/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✓ Script hochgeladen! Alle Key-Inhaber erhalten jetzt dieses Script.');
        setFormData({ name: '', description: '', scriptContent: '', category: 'Tool' });
        setShowForm(false);
        loadProjects();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Verbindungsfehler');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id, name) => {
    if (!window.confirm(`"${name}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`${API_URL}/scripts/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('✓ Projekt gelöscht');
        loadProjects();
      } else {
        const d = await res.json();
        setMessage(`❌ ${d.message}`);
      }
    } catch (err) {
      setMessage('❌ Verbindungsfehler');
    }
  };

  const activeProject = projects.find(p => p.isActive);

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">Projekt Verwaltung</h1>
        <p className="text-slate-400">Lade dein Lua-Script hoch — alle Key-Inhaber führen es beim Start aus</p>
      </div>

      {/* Active Script Banner */}
      {activeProject && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center gap-3">
          <Check size={18} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-semibold">Aktives Script: <span className="text-white">{activeProject.name}</span></p>
            <p className="text-green-500 text-xs mt-1">Dieses Script wird an alle verifizierten Key-Inhaber ausgeliefert</p>
          </div>
        </div>
      )}
      {!activeProject && !loading && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg flex items-center gap-3">
          <X size={18} className="text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-300 font-semibold">Kein aktives Script</p>
            <p className="text-yellow-500 text-xs mt-1">Lade ein Script hoch damit Key-Inhaber es ausführen können</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Scripts verwalten</h3>
            <p className="text-xs text-slate-400 mt-1">Das neueste aktive Script wird ausgeliefert</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadProjects} disabled={loading} className="btn-icon hover:scale-110 transition">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Neues Script
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.startsWith('✓')
          ? 'bg-green-900/30 border-green-700/50 text-green-300'
          : 'bg-red-900/30 border-red-700/50 text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Code size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Neues Script hochladen</h3>
              <p className="text-xs text-slate-400">Lua-Code eingeben — wird sofort aktiv nach dem Speichern</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Script Name *</label>
                <input type="text" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="z.B. FocusHub v1.0" className="w-full px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Kategorie</label>
                <select value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-600">
                  <option>Tool</option>
                  <option>Game</option>
                  <option>Utility</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Beschreibung</label>
              <input type="text" value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional..." className="w-full px-4 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Lua Script Code *</label>
              <textarea value={formData.scriptContent}
                onChange={e => setFormData(p => ({ ...p, scriptContent: e.target.value }))}
                placeholder="-- Dein Lua Script hier einfügen..."
                rows={14}
                className="w-full px-4 py-3 rounded font-mono text-sm bg-slate-900 text-green-300 border border-slate-600 focus:border-blue-500 outline-none resize-y"
                required />
              <p className="text-xs text-slate-500 mt-1">{formData.scriptContent.length} Zeichen</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2 flex-1 justify-center">
                {saving ? <><div className="loading-spinner"></div>Wird gespeichert...</> : <><Check size={18} />Script speichern & aktivieren</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="btn-icon px-4">
                <X size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Alle Scripts ({projects.length})</h3>
          <p className="text-xs text-slate-400 mt-1">Das neueste Script wird automatisch an Key-Inhaber ausgeliefert</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="loading-spinner"></div>
              <p className="text-slate-400">Wird geladen...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-lg">Noch keine Scripts hochgeladen</p>
            <p className="text-slate-500 text-sm mt-2">Klick auf "Neues Script" um dein Lua-Script zu hinterlegen</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Kategorie</th>
                  <th>Status</th>
                  <th>Größe</th>
                  <th>Erstellt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div>
                        <p className="font-semibold text-white">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td>
                      {p.isActive ? (
                        <span className="badge badge-success">Aktiv</span>
                      ) : (
                        <span className="badge badge-warning">Inaktiv</span>
                      )}
                    </td>
                    <td className="text-sm text-slate-400">
                      {p.scriptContent ? `${(p.scriptContent.length / 1024).toFixed(1)} KB` : '-'}
                    </td>
                    <td className="text-sm text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteProject(p._id, p.name)}
                        className="btn-icon text-red-400 hover:text-red-300 hover:scale-110 transition"
                        title="Löschen">
                        <Trash2 size={16} />
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
}
