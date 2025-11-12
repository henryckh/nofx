import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useSWR from 'swr';
import { api } from '../lib/api';
import { FlipNumber } from './FlipNumber';

interface AssetCurveProps {
  timeframe?: string;
  tradingMode?: string;
}

interface AssetCurveData {
  timestamp?: number;
  datetime_str?: string;
  date?: string;
  account_id: number;
  total_assets: number;
  cash: number;
  positions_value: number;
  user_id: number;
  username: string;
}

export function AssetCurve({ timeframe = '5m', tradingMode = 'paper' }: AssetCurveProps) {
  const [hoveredAccountId, setHoveredAccountId] = useState<number | null>(null);
  const getAccountKey = (accountId: number) => `account_${accountId}`;

  // Get asset curve data from Hyper-Alpha-Arena backend
  const { data: assetCurveData, isLoading } = useSWR(
    `hyper-alpha-arena-asset-curve-${timeframe}-${tradingMode}`,
    async () => {
      return await api.getHyperAlphaArenaAssetCurve({
        timeframe,
        trading_mode: tradingMode,
      });
    },
    {
      refreshInterval: 60000, // 60 seconds
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // Process chart data from Hyper-Alpha-Arena
  const chartData = useMemo(() => {
    if (!assetCurveData || !Array.isArray(assetCurveData) || assetCurveData.length === 0) {
      return [];
    }

    // Group data by timestamp
    const timestampMap = new Map<string, {
      timestamp: string;
      time: string;
      accounts: Map<string, number>;
    }>();

    assetCurveData.forEach((point: AssetCurveData) => {
      const ts = point.datetime_str || point.date || point.timestamp?.toString() || '';
      if (!ts) return;

      if (!timestampMap.has(ts)) {
        const date = point.datetime_str 
          ? new Date(point.datetime_str)
          : point.timestamp 
          ? new Date(point.timestamp * (point.timestamp.toString().length <= 10 ? 1000 : 1))
          : new Date();
        const time = date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        timestampMap.set(ts, {
          timestamp: ts,
          time,
          accounts: new Map(),
        });
      }

      const accountKey = getAccountKey(point.account_id);
      timestampMap.get(ts)!.accounts.set(accountKey, point.total_assets || 0);
    });

    // Convert to array and sort by timestamp
    const sortedData = Array.from(timestampMap.entries())
      .sort(([tsA], [tsB]) => {
        const dateA = new Date(tsA).getTime();
        const dateB = new Date(tsB).getTime();
        return dateA - dateB;
      })
      .map(([ts, data]) => {
        const entry: any = {
          timestamp: ts,
          time: data.time,
        };

        // Add all account data to the entry
        data.accounts.forEach((assets, accountKey) => {
          entry[accountKey] = assets;
        });

        return entry;
      });

    return sortedData;
  }, [assetCurveData]);

  // Get unique accounts from asset curve data
  const uniqueAccounts = useMemo(() => {
    if (!assetCurveData || !Array.isArray(assetCurveData)) return [];
    
    const accountMap = new Map<string, { account_id: number; username: string; latest_assets: number; key: string }>();
    
    assetCurveData.forEach((point: AssetCurveData) => {
      const key = getAccountKey(point.account_id);
      const existing = accountMap.get(key);
      const assets = point.total_assets || 0;
      
      if (!existing || assets > existing.latest_assets) {
        accountMap.set(key, {
          account_id: point.account_id,
          username: point.username || `Account ${point.account_id}`,
          key,
          latest_assets: assets,
        });
      }
    });
    
    return Array.from(accountMap.values()).sort((a, b) => b.latest_assets - a.latest_assets);
  }, [assetCurveData]);

  // Calculate Y-axis domain
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 100000];

    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((point) => {
      uniqueAccounts.forEach((account) => {
        const key = account.key;
        const value = point[key];
        if (typeof value === 'number' && !isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    if (min === Infinity || max === -Infinity) return [0, 100000];

    const range = max - min;
    const padding = Math.max(range * 0.1, 50);
    const paddedMin = Math.max(0, min - padding);
    const paddedMax = max + padding;

    return [paddedMin, paddedMax];
  }, [chartData, uniqueAccounts]);

  // Account summaries for ranking
  const accountSummaries = useMemo(() => {
    if (!chartData.length || uniqueAccounts.length === 0) return [];

    return uniqueAccounts.map((account) => {
      const key = account.key;
      const latestPoint = chartData
        .filter((point) => point[key] !== undefined)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return {
        account_id: account.account_id,
        username: account.username,
        key: account.key,
        assets: latestPoint?.[key] || account.latest_assets || 0,
      };
    }).sort((a, b) => b.assets - a.assets);
  }, [chartData, uniqueAccounts]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded p-3 shadow-xl"
          style={{ background: '#1E2329', border: '1px solid #2B3139' }}
        >
          <div className="text-xs mb-2" style={{ color: '#848E9C' }}>
            {data.time}
          </div>
          {uniqueAccounts.map((account, index) => {
            const key = account.key;
            const assets = data[key];
            if (assets === undefined) return null;

            // Use a simple color based on account index
            const colors = ['#F0B90B', '#0ECB81', '#F6465D', '#627eea', '#9945ff'];
            const color = colors[index % colors.length];

            return (
              <div key={account.account_id} className="mb-1.5 last:mb-0">
                <div
                  className="text-xs font-semibold mb-0.5"
                  style={{ color }}
                >
                  {account.username}
                </div>
                <div className="text-sm font-bold" style={{ color: '#EAECEF' }}>
                  <FlipNumber value={assets} prefix="$" decimals={2} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div style={{ color: '#848E9C' }}>Loading chart data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div style={{ color: '#848E9C' }}>No chart data available</div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-6">
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="relative h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              onMouseLeave={() => setHoveredAccountId(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
              <XAxis
                dataKey="time"
                stroke="#5E6673"
                tick={{ fill: '#848E9C', fontSize: 11 }}
                tickLine={{ stroke: '#2B3139' }}
                interval={Math.floor(chartData.length / 8)}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#5E6673"
                tick={{ fill: '#848E9C', fontSize: 12 }}
                tickLine={{ stroke: '#2B3139' }}
                domain={yAxisDomain}
                tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              {uniqueAccounts.map((account, index) => {
                const key = account.key;
                const colors = ['#F0B90B', '#0ECB81', '#F6465D', '#627eea', '#9945ff', '#f3ba2f'];
                const color = colors[index % colors.length];
                const isHovered = hoveredAccountId === account.account_id;
                const isHighlighted = !hoveredAccountId || isHovered;

                return (
                  <Line
                    key={account.key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    dot={false}
                    activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                    name={account.username}
                    strokeOpacity={isHighlighted ? 1 : 0.3}
                    isAnimationActive={false}
                    onMouseEnter={() => setHoveredAccountId(account.account_id)}
                    onMouseLeave={() => setHoveredAccountId(null)}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Asset Ranking */}
      <div className="mt-6">
        <div className="text-xs font-medium mb-3" style={{ color: '#848E9C' }}>
          Account Asset Ranking
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accountSummaries.map((summary, index) => {
            const isMuted = hoveredAccountId && hoveredAccountId !== summary.account_id;
            const colors = ['#F0B90B', '#0ECB81', '#F6465D', '#627eea', '#9945ff', '#f3ba2f'];
            const color = colors[index % colors.length];

            return (
              <div
                key={summary.account_id}
                className="rounded-lg px-4 py-3 flex items-center gap-3 min-w-0"
                style={{
                  background: 'rgba(43, 49, 57, 0.5)',
                  border: `1px solid ${color}40`,
                  opacity: isMuted ? 0.4 : 1,
                }}
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: color }}
                >
                  {summary.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium" style={{ color: '#848E9C' }}>
                    {summary.username}
                  </div>
                  <div className="text-lg font-bold" style={{ color: '#EAECEF' }}>
                    <FlipNumber value={summary.assets} prefix="$" decimals={2} />
                  </div>
                </div>
                <div className="text-xs font-semibold" style={{ color }}>
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

