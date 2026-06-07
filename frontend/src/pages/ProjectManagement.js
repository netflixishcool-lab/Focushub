import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scriptContent: '',
    category: 'Tool',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Lade Projekte beim Laden der Component
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/scripts/projects`);
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Fehler beim Laden der Projekte:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/scripts/projects`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('✓ Projekt erfolgreich hochgeladen!');
      setFormData({
        name: '',
        description: '',
        scriptContent: '',
        category: 'Tool',
        isPublic: true
      });
      
      setTimeout(() => {
        setShowUploadForm(false);
        loadProjects();
      }, 1500);
    } catch (error) {
      setMessage(`✗ Fehler: ${error.response?.data?.message || 'Fehler beim Upload'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Projekt wirklich löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${API_URL}/scripts/projects/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage('✓ Projekt gelöscht!');
      loadProjects();
    } catch (error) {
      setMessage(`✗ Fehler: ${error.response?.data?.message || 'Fehler beim Löschen'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎮 Projekt Verwaltung</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition"
          >
            {showUploadForm ? '✕ Abbrechen' : '+ Neues Projekt'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded mb-6 ${message.includes('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {message}
          </div>
        )}

        {showUploadForm && (
          <div className="bg-gray-800 p-8 rounded-lg mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Neues Script Projekt</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Projekt Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="z.B. Aimbot Tool"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Kategorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
                  >
                    <option>Game</option>
                    <option>Tool</option>
                    <option>Utility</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Beschreibung</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Was macht dieses Projekt?"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Lua Script Code *</label>
                <textarea
                  name="scriptContent"
                  value={formData.scriptContent}
                  onChange={handleInputChange}
                  placeholder="Dein Lua-Script hier eingeben..."
                  required
                  rows="10"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  id="isPublic"
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm font-bold cursor-pointer">
                  Öffentlich (für alle Benutzer sichtbar)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-bold transition disabled:opacity-50"
              >
                {loading ? '⏳ Wird hochgeladen...' : '✓ Projekt Speichern'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map(project => (
              <div key={project._id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded mt-2 inline-block">
                      {project.category}
                    </span>
                  </div>
                  <span className="text-2xl">
                    {project.isPublic ? '🌐' : '🔒'}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">Version</div>
                    <div className="font-bold">{project.version}</div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">Downloads</div>
                    <div className="font-bold">{project.downloads}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-bold transition"
                  >
                    �️ Löschen
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(project.scriptContent)}`;
                      link.download = `${project.name}.lua`;
                      link.click();
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm font-bold transition"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-lg">Noch keine Projekte hochgeladen</p>
              <p className="text-sm">Klick auf "+ Neues Projekt" um zu starten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
