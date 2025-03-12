import React, { useState } from 'react';
import { Search, TrendingUp, Users } from 'lucide-react';
import { YapsData } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<YapsData | null>(null);
  const [error, setError] = useState('');

  const fetchYapsData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    setUserData(null);
    
    try {
      const response = await fetch(`/.netlify/functions/yaps?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User @${username} not found. Please check the username and try again.`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Failed to fetch data. Please try again later.');
        }
      }
      
      if (!data || typeof data.yaps_all === 'undefined') {
        throw new Error('Invalid data received from the server.');
      }
      
      setUserData(data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchYapsData();
  };

  const chartData = userData ? [
    { name: '24h', yaps: userData.yaps_l24h },
    { name: '48h', yaps: userData.yaps_l48h },
    { name: '7d', yaps: userData.yaps_l7d },
    { name: '30d', yaps: userData.yaps_l30d },
    { name: '3m', yaps: userData.yaps_l3m },
    { name: '6m', yaps: userData.yaps_l6m },
    { name: '12m', yaps: userData.yaps_l12m },
    { name: 'All Time', yaps: userData.yaps_all },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#7CFFD3] mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Yaps Analytics Dashboard
          </h1>
          <p className="text-gray-400">Analyze attention metrics for X users using Kaito Yaps</p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                placeholder="Enter X username (without @)"
                className="w-full px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#7CFFD3] focus:border-transparent"
                disabled={loading}
              />
              <Search className="absolute right-3 top-2.5 text-gray-500" />
            </div>
            <button
              type="submit"
              disabled={loading || !username}
              className="px-6 py-2 bg-[#7CFFD3] text-black font-semibold rounded-lg hover:bg-[#5BDFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Loading...
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {userData && (
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-[#333333] p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Users className="w-12 h-12 text-[#7CFFD3]" />
              <div>
                <h2 className="text-2xl font-bold text-white">@{userData.username}</h2>
                <p className="text-gray-400">User ID: {userData.user_id}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#7CFFD3]">Attention Metrics Over Time</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="name" stroke="#666666" />
                    <YAxis stroke="#666666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #333333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="yaps" 
                      stroke="#7CFFD3" 
                      strokeWidth={2}
                      dot={{ fill: '#7CFFD3' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                <h4 className="text-sm text-gray-400">24h Yaps</h4>
                <p className="text-xl font-bold text-[#7CFFD3]">{userData.yaps_l24h.toFixed(2)}</p>
              </div>
              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                <h4 className="text-sm text-gray-400">7d Yaps</h4>
                <p className="text-xl font-bold text-[#7CFFD3]">{userData.yaps_l7d.toFixed(2)}</p>
              </div>
              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                <h4 className="text-sm text-gray-400">30d Yaps</h4>
                <p className="text-xl font-bold text-[#7CFFD3]">{userData.yaps_l30d.toFixed(2)}</p>
              </div>
              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                <h4 className="text-sm text-gray-400">All Time Yaps</h4>
                <p className="text-xl font-bold text-[#7CFFD3]">{userData.yaps_all.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;