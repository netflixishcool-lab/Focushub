import React, { useEffect } from 'react';
import { useLicenseStore } from '../../store.js';
import { Check, Copy } from 'lucide-react';

export default function Dashboard() {
  const { myHWIDs, getHWIDs } = useLicenseStore();
  const [activateForm, setActivateForm] = React.useState({ key: '', hwid: '' });
  const [activationResult, setActivationResult] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    getHWIDs();
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      const result = await useLicenseStore.getState().activateLicense(
        activateForm.key,
        activateForm.hwid
      );
      setActivationResult(result);
      setActivateForm({ key: '', hwid: '' });
      setTimeout(() => setActivationResult(null), 5000);
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Welcome to Luarmor</h1>
        <p className="text-gray-400">Secure License Management System with HWID Protection</p>
      </div>

      {/* Activation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* License Activation */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Activate License</h2>
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">License Key</label>
              <input
                type="text"
                value={activateForm.key}
                onChange={(e) => setActivateForm({...activateForm, key: e.target.value})}
                className="input w-full font-mono"
                placeholder="Paste your license key here"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hardware ID (HWID)</label>
              <input
                type="text"
                value={activateForm.hwid}
                onChange={(e) => setActivateForm({...activateForm, hwid: e.target.value})}
                className="input w-full font-mono"
                placeholder="Your 64-character HWID"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Generate your HWID using our client application
              </p>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Activate License
            </button>
          </form>

          {activationResult && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check size={18} />
                <span className="font-medium">Activation Successful!</span>
              </div>
              <div className="space-y-1 text-sm text-green-300">
                <p><strong>Product:</strong> {activationResult.license.product}</p>
                <p><strong>Activated:</strong> {new Date(activationResult.license.activated_at).toLocaleString()}</p>
                {activationResult.license.expires_at && (
                  <p><strong>Expires:</strong> {new Date(activationResult.license.expires_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Your HWIDs */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Hardware IDs</h2>
          {myHWIDs && myHWIDs.length > 0 ? (
            <div className="space-y-3">
              {myHWIDs.map(hwid => (
                <div key={hwid.id} className="bg-luarmor-darker rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-luarmor-primary font-mono">
                      {hwid.hwid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(hwid.hwid)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {hwid.verified && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        ✓ Verified
                      </span>
                    )}
                    <span>First seen: {new Date(hwid.first_seen).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No HWIDs registered yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Activate a license to register your hardware ID
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-bold mb-2">🔐 Secure</h3>
          <p className="text-sm text-gray-400">
            AES-256 encryption for all sensitive data
          </p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">🛡️ HWID Protection</h3>
          <p className="text-sm text-gray-400">
            Hardware-based license verification
          </p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">🤖 Discord Bot</h3>
          <p className="text-sm text-gray-400">
            Manage licenses via Discord commands
          </p>
        </div>
      </div>
    </div>
  );
}
