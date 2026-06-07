import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login fehlgeschlagen');
        return;
      }

      onLogin(data.token);
    } catch (err) {
      setError('Verbindungsfehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        {/* Card */}
        <div className="backdrop-blur-xl bg-slate-800/40 rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">FocusHub</h1>
            <p className="text-slate-400 text-sm">Admin Panel Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@focushub.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-6"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Wird angemeldet...
                </>
              ) : (
                <>
                  Anmelden
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Demo Credentials */}
            <div className="pt-4 border-t border-slate-600/50">
              <p className="text-xs text-slate-400 text-center mb-2">📝 Demo-Anmeldedaten:</p>
              <div className="bg-slate-900/50 rounded-lg p-2 text-xs text-slate-300 text-center space-y-1">
                <p>E-Mail: <span className="text-blue-400 font-mono">admin@focushub.com</span></p>
                <p>Passwort: <span className="text-blue-400 font-mono">B6A4A7Admin123</span></p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          <p>🔒 Sicheres Admin Panel System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;