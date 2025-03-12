import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  Users,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { YapsData } from './types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function App() {
  const [usernames, setUsernames] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<(YapsData | null)[]>([]);
  const [error, setError] = useState('');

  const fetchYapsData = async (username: string, index: number) => {
    if (!username) return;

    setLoading(true);
    setError('');
    const newUserData = [...userData];
    newUserData[index] = null;
    setUserData(newUserData);

    try {
      const response = await fetch(
        `https://kaitoscan.com/.netlify/functions/yaps?username=${encodeURIComponent(
          username
        )}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `User @${username} not found. Please check the username and try again.`
          );
        } else if (response.status === 429) {
          throw new Error(
            'Rate limit exceeded. Please wait a moment and try again.'
          );
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Failed to fetch data. Please try again later.');
        }
      }

      if (!data || typeof data.yaps_all === 'undefined') {
        throw new Error('Invalid data received from the server.');
      }

      newUserData[index] = data;
      setUserData(newUserData);
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    usernames.forEach((username, index) => {
      if (username) fetchYapsData(username, index);
    });
  };

  const addUserInput = () => {
    if (usernames.length < 2) {
      setUsernames([...usernames, '']);
      setUserData([...userData, null]);
    }
  };

  const removeUserInput = (index: number) => {
    const newUsernames = usernames.filter((_, i) => i !== index);
    const newUserData = userData.filter((_, i) => i !== index);
    setUsernames(newUsernames);
    setUserData(newUserData);
  };

  const handleInputChange = (value: string, index: number) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value.trim();
    setUsernames(newUsernames);

    const newUserData = [...userData];
    newUserData[index] = null; // Clear data for the changed input
    setUserData(newUserData);
  };

  const chartData = userData.some((data) => data)
    ? [
        {
          name: '24h',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l24h }),
            {}
          ),
        },
        {
          name: '48h',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l48h }),
            {}
          ),
        },
        {
          name: '7d',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l7d }),
            {}
          ),
        },
        {
          name: '30d',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l30d }),
            {}
          ),
        },
        {
          name: '3m',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l3m }),
            {}
          ),
        },
        {
          name: '6m',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l6m }),
            {}
          ),
        },
        {
          name: '12m',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_l12m }),
            {}
          ),
        },
        {
          name: 'All Time',
          ...userData.reduce(
            (acc, data, i) => ({ ...acc, [`yaps${i + 1}`]: data?.yaps_all }),
            {}
          ),
        },
      ]
    : [];

  const colors = ['#7CFFD3', '#FFD37C', '#FF7C7C'];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#7CFFD3] mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Yaps Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Analyze attention metrics for X users using Kaito Yaps
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {usernames.map((username, index) => (
              <div key={index} className="relative flex items-center">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  placeholder={`Enter X username ${index + 1} (without @)`}
                  className="w-full pl-4 pr-10 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#7CFFD3] focus:border-transparent"
                  disabled={loading}
                />
                <Search className="absolute right-10 top-2.5 text-gray-500" />
                {index > 0 && (
                  <MinusCircle
                    className="absolute right-3 top-2.5 text-red-500 cursor-pointer"
                    onClick={() => removeUserInput(index)}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={loading || usernames.every((username) => !username)}
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
          {userData.some((data) => data) && usernames.length < 2 && (
            <button
              type="button"
              onClick={addUserInput}
              className="flex items-center gap-2 text-[#7CFFD3] hover:text-[#5BDFB3] transition-colors duration-200 mt-4"
            >
              <PlusCircle className="w-6 h-6" />
              Add another user
            </button>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {userData.some((data) => data) && (
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-[#333333] p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Users className="w-12 h-12 text-[#7CFFD3]" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {userData
                    .map((data, i) => data && `@${data.username}`)
                    .filter(Boolean)
                    .join(' vs ')}
                </h2>
                <p className="text-gray-400">
                  User IDs:{' '}
                  {userData
                    .map((data) => data?.user_id)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#7CFFD3]">
                Attention Metrics Over Time
              </h3>
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
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    {userData.map(
                      (data, i) =>
                        data && (
                          <Line
                            key={i}
                            type="monotone"
                            dataKey={`yaps${i + 1}`}
                            stroke={colors[i]}
                            strokeWidth={2}
                            dot={{ fill: colors[i] }}
                            name={`@${data.username}`}
                          />
                        )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {userData.map(
              (data, i) =>
                data && (
                  <div
                    key={i}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
                  >
                    <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                      <h4 className="text-sm text-gray-400">24h Yaps</h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: colors[i] }}
                      >
                        {data.yaps_l24h.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                      <h4 className="text-sm text-gray-400">7d Yaps</h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: colors[i] }}
                      >
                        {data.yaps_l7d.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                      <h4 className="text-sm text-gray-400">30d Yaps</h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: colors[i] }}
                      >
                        {data.yaps_l30d.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                      <h4 className="text-sm text-gray-400">All Time Yaps</h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: colors[i] }}
                      >
                        {data.yaps_all.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
