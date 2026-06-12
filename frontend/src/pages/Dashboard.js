import React, { useState, useEffect } from 'react';
import { Users, Key, TrendingUp, Activity, Crown } from 'lucide-react';
import { API_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner"></div>
          <p className="text-slate-400">Wird geladen...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'gradient-blue',
      trend: '+12%',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'gradient-green',
      trend: '+8%',
      description: 'Currently online'
    },
    {
      title: 'Total Keys',
      value: stats?.totalKeys || 0,
      icon: Key,
      color: 'gradient-purple',
      trend: '+24',
      description: 'Available licenses'
    },
    {
      title: 'Redeemed Keys',
      value: stats?.redeemedKeys || 0,
      icon: Crown,
      color: 'gradient-orange',
      trend: '',
      description: 'Eingelöste Keys'
    }
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Real-time system overview & statistics</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`stat-card ${card.color}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold">
                    {card.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                </div>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Icon size={20} className="opacity-70" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="value text-3xl">{card.value}</div>
                <span className="text-xs text-green-400 font-semibold">{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Status Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Key Status</h3>
              <p className="text-xs text-slate-400">License key management</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-300 font-semibold">Redeemed Keys</p>
                <p className="text-xs text-slate-500">Already activated</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-400">{stats?.redeemedKeys || 0}</span>
                <TrendingUp size={18} className="text-green-400" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-300 font-semibold">Available Keys</p>
                <p className="text-xs text-slate-500">Still redeemable</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-400">{stats?.availableKeys || 0}</span>
                <Key size={18} className="text-yellow-400" />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/30 rounded-lg">
              <p className="text-xs text-blue-300">
                <span className="font-bold">💡 Info:</span> Generieren Sie neue Keys im Key Management Panel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;