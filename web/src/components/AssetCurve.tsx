import { useEffect, useMemo, useState } from 'react';
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
  const [activeAccountKeys, setActiveAccountKeys] = useState<Set<string>>(new Set());
  const getAccountKey = (accountId: number) => `account_${accountId}`;
  const colorPalette = ['#F0B90B', '#0ECB81', '#F6465D', '#627eea', '#9945ff', '#00B8D9', '#FF9F43', '#8A63D2'];
  const fallbackColor = '#7E8494';

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

  // Initialize active set and keep it in sync with available accounts
  useEffect(() => {
    if (!uniqueAccounts.length) return;
    setActiveAccountKeys((prev) => {
      if (prev.size === 0) {
        return new Set(uniqueAccounts.map((account) => account.key));
      }
      const next = new Set<string>();
      uniqueAccounts.forEach((account) => {
        if (prev.has(account.key)) {
          next.add(account.key);
        }
      });
      return next.size ? next : new Set(uniqueAccounts.map((account) => account.key));
    });
  }, [uniqueAccounts]);

  const lastPointByKey = useMemo(() => {
    const result: Record<string, { index: number; value: number }> = {};
    chartData.forEach((point, index) => {
      uniqueAccounts.forEach((account) => {
        const key = account.key;
        const value = point[key];
        if (typeof value === 'number') {
          result[key] = { index, value };
        }
      });
    });
    return result;
  }, [chartData, uniqueAccounts]);

  const getColorForAccount = (accountId: number, index: number) => {
    const colorIndex = Number.isFinite(accountId) ? (Math.abs(accountId) % colorPalette.length) : index % colorPalette.length;
    return colorPalette[colorIndex] ?? fallbackColor;
  };

  const renderEndDot = (account: { key: string; username: string; account_id: number }, color: string) => {
    const initials =
      account.username
        .split(' ')
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 3) || 'A';

    return (props: any) => {
      const { cx, cy, index } = props ?? {};
      if (cx == null || cy == null) return <g />;
      const last = lastPointByKey[account.key];
      if (!last || last.index !== index) return <g />;

      const value = last.value;
      const displayValue =
        typeof value === 'number'
          ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '--';

      return (
        <g transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: 'none' }}>
          <circle r={16} fill={`${color}1A`} />
          <circle r={12} fill={color} stroke="white" strokeWidth={1.5} />
          <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight={600} fill="#FFFFFF">
            {initials}
          </text>
          <foreignObject x={18} y={-14} width={120} height={28}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: color,
                background: '#101214',
                borderRadius: 6,
                padding: '4px 8px',
                display: 'inline-block',
              }}
            >
              {displayValue}
            </div>
          </foreignObject>
        </g>
      );
    };
  };

  const toggleAccount = (key: string) => {
    setActiveAccountKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (next.size === 0) {
        return new Set([key]);
      }
      return next;
    });
  };

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

            const color = getColorForAccount(account.account_id, index);

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
              margin={{ top: 20, right: 120, left: 20, bottom: 40 }}
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
                const color = getColorForAccount(account.account_id, index);
                const isHovered = hoveredAccountId === account.account_id;
                const isActive = activeAccountKeys.has(key);
                const isHighlighted = (!hoveredAccountId || isHovered) && isActive;

                return (
                  <Line
                    key={account.key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    dot={renderEndDot(account, color)}
                    // activeDot={true}
                    connectNulls={false}
                    name={account.username}
                    strokeOpacity={isHighlighted ? 1 : 0.15}
                    isAnimationActive={false}
                    hide={!isActive}
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
        <div className="flex flex-wrap gap-3">
          {accountSummaries.map((summary, index) => {
            const isMuted = hoveredAccountId && hoveredAccountId !== summary.account_id;
            const color = getColorForAccount(summary.account_id, index);
            const isActive = activeAccountKeys.has(summary.key);

            return (
              <button
                key={summary.key}
                className="rounded-lg px-4 py-3 flex items-center gap-3 min-w-[200px] transition-all"
                style={{
                  background: 'rgba(43, 49, 57, 0.5)',
                  border: `1px solid ${color}40`,
                  opacity: isMuted || !isActive ? 0.45 : 1,
                  cursor: 'pointer',
                }}
                onClick={() => toggleAccount(summary.key)}
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: color }}
                >
                  {summary.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 text-left">
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

