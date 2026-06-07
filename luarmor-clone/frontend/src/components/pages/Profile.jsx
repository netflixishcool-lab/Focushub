import React from 'react';
import { useAuthStore } from '../../store.js';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="card max-w-md">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Username</p>
            <p className="text-lg font-medium">{user?.username}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Account Type</p>
            <p className="text-lg font-medium">
              {user?.is_admin ? '🔑 Administrator' : '👤 User'}
            </p>
          </div>

          {user?.discord_id && (
            <div>
              <p className="text-gray-400 text-sm">Discord ID</p>
              <p className="text-lg font-medium font-mono">{user.discord_id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
