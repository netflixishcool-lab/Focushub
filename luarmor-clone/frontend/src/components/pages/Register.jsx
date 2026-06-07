import React, { useState } from 'react';
import { useAuthStore } from '../../store.js';
import { Eye, EyeOff } from 'lucide-react';

export default function Register({ onLoginClick }) {
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onLoginClick(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luarmor-darker to-luarmor-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-luarmor-dark rounded-lg border border-gray-800 p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-luarmor-secondary rounded-lg mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-gray-400 mt-2">Join Luarmor License Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input w-full"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter your email"
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
                  placeholder="Enter a strong password"
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

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-luarmor-danger/20 border border-luarmor-danger rounded-lg p-3 text-sm text-luarmor-danger">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-secondary w-full"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onLoginClick}
                className="text-luarmor-primary hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
