import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  Users,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Wallet,
  Copy,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { YapsData } from './types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { XIcon } from './components/XIcon';

function App() {
  const [usernames, setUsernames] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<(YapsData | null)[]>([]);
  const [error, setError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Reset error when usernames change
  useEffect(() => {
    setError('');
  }, [usernames]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);

  // Ensure userData array length matches usernames array length
  useEffect(() => {
    if (userData.length !== usernames.length) {
      setUserData((prev) => {
        const newData = [...prev];
        while (newData.length < usernames.length) {
          newData.push(null);
        }
        return newData.slice(0, usernames.length);
      });
    }
  }, [usernames.length]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
  };

  const fetchYapsData = async (username: string, index: number) => {
    if (!username.trim()) return;

    try {
      const response = await fetch(
        `https://kaitoscan.com/.netlify/functions/yaps?username=${encodeURIComponent(
          username.trim()
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
        throw new Error(
          response.status === 404
            ? `User @${username} not found. Please check the username and try again.`
            : response.status === 429
            ? 'Rate limit exceeded. Please wait a moment and try again.'
            : data.error || 'Failed to fetch data. Please try again later.'
        );
      }

      if (!data || typeof data.yaps_all === 'undefined') {
        throw new Error('Invalid data received from the server.');
      }

      setUserData((prev) => {
        const newData = [...prev];
        newData[index] = data;
        return newData;
      });
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );

      // Clear the data for this index on error
      setUserData((prev) => {
        const newData = [...prev];
        newData[index] = null;
        return newData;
      });
      throw err; // Re-throw to handle in the Promise.all
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validUsernames = usernames.filter((username) => username.trim());
    if (validUsernames.length === 0) {
      setError('Please enter at least one username.');
      return;
    }

    setLoading(true);

    try {
      // Fetch data for all valid usernames
      await Promise.all(
        usernames.map((username, index) => {
          if (username.trim()) {
            return fetchYapsData(username, index);
          }
          return Promise.resolve();
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const addUserInput = () => {
    if (usernames.length < 2) {
      setUsernames((prev) => [...prev, '']);
      setUserData((prev) => [...prev, null]);
    }
  };

  const removeUserInput = (index: number) => {
    setUsernames((prev) => prev.filter((_, i) => i !== index));
    setUserData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (value: string, index: number) => {
    setUsernames((prev) => {
      const newUsernames = [...prev];
      newUsernames[index] = value.trim();
      return newUsernames;
    });
  };

  const timeframes = [
    { key: 'l24h', label: '24h' },
    { key: 'l48h', label: '48h' },
    { key: 'l7d', label: '7d' },
    { key: 'l30d', label: '30d' },
    { key: 'l3m', label: '3m' },
    { key: 'l6m', label: '6m' },
    { key: 'l12m', label: '12m' },
    { key: 'all', label: 'All Time' },
  ];

  const chartData = userData.some((data) => data)
    ? timeframes.map(({ key, label }) => ({
        name: label,
        ...userData.reduce((acc, data, i) => {
          if (data) {
            acc[`yaps${i + 1}`] = data[`yaps_${key}` as keyof YapsData];
          }
          return acc;
        }, {} as Record<string, number>),
      }))
    : [];

  const colors = ['#7CFFD3', '#FFD37C'];

  const donationAddresses = [
    {
      chain: 'EVM',
      address: '0xceadd96e9298a257ebabc2832dbcbced39b6b013',
      color: '#7CFFD3',
    },
    {
      chain: 'Solana',
      address: 'FCc8aXe1C8x3EKfcDe8uAEzAa4ohCkR5H8xHUMf644b1',
      color: '#FFD37C',
    },
  ];

  const statsConfig = [
    { key: 'l24h', label: '24h Yaps' },
    { key: 'l48h', label: '48h Yaps' },
    { key: 'l7d', label: '7d Yaps' },
    { key: 'l30d', label: '30d Yaps' },
    { key: 'l3m', label: '3m Yaps' },
    { key: 'l6m', label: '6m Yaps' },
    { key: 'l12m', label: '12m Yaps' },
    { key: 'all', label: 'All Time' },
  ];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 40, bottom: 5 },
    };

    const commonGridProps = {
      strokeDasharray: '3 3',
      stroke: '#333333',
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps} layout="vertical">
          <CartesianGrid {...commonGridProps} />
          <XAxis type="number" stroke="#666666" />
          <YAxis dataKey="name" type="category" stroke="#666666" width={80} />
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
                <Bar
                  key={i}
                  dataKey={`yaps${i + 1}`}
                  fill={colors[i]}
                  name={`@${data.username}`}
                />
              )
          )}
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid {...commonGridProps} />
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
                isAnimationActive={false}
              />
            )
        )}
      </LineChart>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#7CFFD3] mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Yaps Analytics Dashboard
          </h1>
          <p className="text-gray-400 mb-2">
            Compare attention metrics between X users using Kaito Yaps
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Made with 💚 by</span>
            <a
              href="https://x.com/itskkoma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#7CFFD3] hover:text-[#5BDFB3] transition-colors"
            >
              <XIcon className="w-4 h-4" />
              @itskkoma
            </a>
          </div>

          {/* Donation Section */}
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md flex flex-col gap-2 bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Wallet className="w-4 h-4" />
                <span>Support API costs</span>
              </div>
              {donationAddresses.map(({ chain, address, color }) => (
                <div
                  key={chain}
                  className="flex items-center gap-2 bg-[#0A0A0A] p-2 rounded border border-[#333333] text-sm"
                >
                  <span style={{ color }}>{chain}</span>
                  <code className="font-mono text-gray-400 text-xs overflow-x-auto">
                    {address}
                  </code>
                  <button
                    onClick={() => handleCopyAddress(address)}
                    className="ml-auto flex-shrink-0 p-1 hover:bg-[#1A1A1A] rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy
                      className={`w-4 h-4 ${
                        copiedAddress === address
                          ? 'text-green-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
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
              disabled={
                loading || usernames.every((username) => !username.trim())
              }
              className="px-6 py-2 bg-[#7CFFD3] text-black font-semibold rounded-lg hover:bg-[#5BDFB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
              Compare with another user
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#7CFFD3]">
                  Attention Metrics Over Time
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded-lg transition-colors ${
                      chartType === 'line'
                        ? 'bg-[#7CFFD3] text-black'
                        : 'bg-[#333333] text-gray-400 hover:bg-[#444444]'
                    }`}
                    title="Line Chart"
                  >
                    <LineChartIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-lg transition-colors ${
                      chartType === 'bar'
                        ? 'bg-[#7CFFD3] text-black'
                        : 'bg-[#333333] text-gray-400 hover:bg-[#444444]'
                    }`}
                    title="Bar Chart"
                  >
                    <BarChartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
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
                    {statsConfig.map(({ key, label }) => (
                      <div
                        key={key}
                        className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]"
                      >
                        <h4 className="text-sm text-gray-400">{label}</h4>
                        <p
                          className="text-xl font-bold"
                          style={{ color: colors[i] }}
                        >
                          {data[`yaps_${key}` as keyof YapsData].toFixed(2)}
                        </p>
                      </div>
                    ))}
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
