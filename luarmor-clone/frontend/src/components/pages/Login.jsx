import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store.js';
import { Eye, EyeOff, Mail } from 'lucide-react';
import API from '../../api.js';

export default function Login({ onRegisterClick }) {
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(formData.username, formData.password);
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luarmor-darker to-luarmor-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-luarmor-dark rounded-lg border border-gray-800 p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-luarmor-primary rounded-lg mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold">Luarmor</h1>
            <p className="text-gray-400 mt-2">License Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username or Email</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <div className="bg-luarmor-danger/20 border border-luarmor-danger rounded-lg p-3 text-sm text-luarmor-danger">
                {error || localError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onRegisterClick}
                className="text-luarmor-primary hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
