import React, { useEffect } from 'react';
import { useAdminStore } from '../../store.js';
import { Copy, Plus, Trash2 } from 'lucide-react';

export default function Admin() {
  const { stats, users, licenses, getStats, getUsers, getLicenses, createLicense } = useAdminStore();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ product_name: '', expires_in_days: '' });
  const [copied, setCopied] = React.useState(null);

  useEffect(() => {
    getStats();
    getUsers();
    getLicenses();
  }, []);

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    try {
      await createLicense(createForm.product_name, createForm.expires_in_days || null);
      setCreateForm({ product_name: '', expires_in_days: '' });
      setShowCreateModal(false);
      getLicenses();
    } catch (error) {
      console.error('Failed to create license:', error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-6">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && [
            { label: 'Total Users', value: stats.total_users, color: 'blue' },
            { label: 'License Keys', value: stats.total_license_keys, color: 'purple' },
            { label: 'Activated', value: stats.activated_keys, color: 'green' },
            { label: 'HWIDs Registered', value: stats.total_hwids, color: 'orange' }
          ].map((stat, idx) => (
            <div key={idx} className="card">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 text-${stat.color}-400`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* License Keys Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">License Keys</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Create License
          </button>
        </div>

        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Key</th>
                <th>Status</th>
                <th>Activated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses && licenses.map(license => (
                <tr key={license.id}>
                  <td className="font-medium">{license.product}</td>
                  <td>
                    <code className="bg-luarmor-darker px-3 py-1 rounded text-sm">
                      {license.key}
                    </code>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      license.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {license.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{license.activated_by}</td>
                  <td>
                    <button
                      onClick={() => copyToClipboard(license.key, `key-${license.id}`)}
                      className="text-luarmor-primary hover:text-blue-400"
                      title="Copy key"
                    >
                      <Copy size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Management */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Users</h2>
        <div className="card overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users && users.map(user => (
                <tr key={user.id}>
                  <td className="font-medium">{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.is_admin ? 'text-luarmor-danger' : 'text-gray-400'}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create License Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-luarmor-dark rounded-lg border border-gray-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create License Key</h3>
            <form onSubmit={handleCreateLicense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={createForm.product_name}
                  onChange={(e) => setCreateForm({...createForm, product_name: e.target.value})}
                  className="input w-full"
                  placeholder="e.g., MyScript Pro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  value={createForm.expires_in_days}
                  onChange={(e) => setCreateForm({...createForm, expires_in_days: e.target.value})}
                  className="input w-full"
                  placeholder="Leave empty for lifetime"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">Create</button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn bg-gray-700 hover:bg-gray-600 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
