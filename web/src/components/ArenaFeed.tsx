import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { api } from '../lib/api';
import { FlipNumber } from './FlipNumber';

type FeedTab = 'trades' | 'model-chat' | 'positions';

interface ArenaFeedProps {
  tradingMode?: string;
  accountId?: number | 'all';
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPercent(value?: number | null) {
  if (value === undefined || value === null) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getSymbolInitials(symbol?: string | null) {
  if (!symbol) return '?';
  return symbol.substring(0, 1).toUpperCase();
}

export function ArenaFeed({ tradingMode = 'paper', accountId = 'all' }: ArenaFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('trades');
  const [expandedChat, setExpandedChat] = useState<number | null>(null);

  // Fetch trades
  const { data: tradesData, isLoading: loadingTrades, mutate: refreshTrades } = useSWR(
    `hyper-alpha-arena-trades-${tradingMode}-${accountId}`,
    async () => {
      return await api.getHyperAlphaArenaTrades({
        limit: 100,
        account_id: accountId === 'all' ? undefined : accountId,
      });
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Fetch model chat
  const { data: modelChatData, isLoading: loadingModelChat, mutate: refreshModelChat } = useSWR(
    `hyper-alpha-arena-model-chat-${tradingMode}-${accountId}`,
    async () => {
      return await api.getHyperAlphaArenaModelChat({
        limit: 60,
        account_id: accountId === 'all' ? undefined : accountId,
      });
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Fetch positions
  const { data: positionsData, isLoading: loadingPositions, mutate: refreshPositions } = useSWR(
    `hyper-alpha-arena-positions-${tradingMode}-${accountId}`,
    async () => {
      return await api.getHyperAlphaArenaPositions({
        account_id: accountId === 'all' ? undefined : accountId,
      });
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  const handleRefresh = useCallback(() => {
    refreshTrades();
    refreshModelChat();
    refreshPositions();
  }, [refreshTrades, refreshModelChat, refreshPositions]);

  const trades = tradesData?.trades || [];
  const modelChat = modelChatData?.entries || [];
  const positions = positionsData?.accounts || [];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-medium uppercase tracking-wide" style={{ color: '#848E9C' }}>
          Showing last {activeTab === 'trades' ? '100' : activeTab === 'model-chat' ? '60' : 'all'} {activeTab}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loadingTrades || loadingModelChat || loadingPositions}
          className="px-3 py-1.5 text-xs rounded border transition-colors"
          style={{
            borderColor: '#2B3139',
            background: '#1E2329',
            color: '#EAECEF',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#2B3139' }}>
        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeTab === 'trades' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'trades' ? '#EAECEF' : '#848E9C',
            borderBottomColor: activeTab === 'trades' ? '#E781FD' : 'transparent',
          }}
        >
          COMPLETED TRADES
        </button>
        <button
          onClick={() => setActiveTab('model-chat')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeTab === 'model-chat' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'model-chat' ? '#EAECEF' : '#848E9C',
            borderBottomColor: activeTab === 'model-chat' ? '#E781FD' : 'transparent',
          }}
        >
          MODELCHAT
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeTab === 'positions' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'positions' ? '#EAECEF' : '#848E9C',
            borderBottomColor: activeTab === 'positions' ? '#E781FD' : 'transparent',
          }}
        >
          POSITIONS
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto mt-0" style={{ maxHeight: '600px' }}>
        {activeTab === 'trades' && (
          <div className="p-4 space-y-4">
            {loadingTrades && trades.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>Loading trades...</div>
            ) : trades.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>No recent trades found.</div>
            ) : (
              trades.map((trade: any) => (
                <div
                  key={`${trade.trade_id}-${trade.trade_time}`}
                  className="rounded px-4 py-3 space-y-2"
                  style={{
                    background: 'rgba(43, 49, 57, 0.5)',
                    border: '1px solid #2B3139',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
                        style={{
                          background: '#E781FD',
                          color: '#0B0E11',
                        }}
                      >
                        {getInitials(trade.account_name)}
                      </div>
                      <span className="font-semibold" style={{ color: '#EAECEF' }}>
                        {trade.account_name}
                      </span>
                    </div>
                    <span style={{ color: '#848E9C' }}>{formatDate(trade.trade_time)}</span>
                  </div>
                  <div className="text-sm flex flex-wrap items-center gap-2" style={{ color: '#EAECEF' }}>
                    <span className="font-semibold">{trade.account_name}</span>
                    <span>completed a</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : trade.side === 'CLOSE'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {trade.side}
                    </span>
                    <span>trade on</span>
                    <span className="flex items-center gap-2 font-semibold">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
                        style={{
                          background: '#2B3139',
                          color: '#EAECEF',
                        }}
                      >
                        {getSymbolInitials(trade.symbol)}
                      </div>
                      {trade.symbol}
                    </span>
                    <span>!</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                        Price
                      </span>
                      <span className="font-medium" style={{ color: '#EAECEF' }}>
                        <FlipNumber value={trade.price} prefix="$" decimals={2} />
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                        Quantity
                      </span>
                      <span className="font-medium" style={{ color: '#EAECEF' }}>
                        <FlipNumber value={trade.quantity} decimals={4} />
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                        Notional
                      </span>
                      <span className="font-medium" style={{ color: '#EAECEF' }}>
                        <FlipNumber value={trade.notional} prefix="$" decimals={2} />
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                        Commission
                      </span>
                      <span className="font-medium" style={{ color: '#EAECEF' }}>
                        <FlipNumber value={trade.commission} prefix="$" decimals={2} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'model-chat' && (
          <div className="p-4 space-y-3">
            {loadingModelChat && modelChat.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>Loading model chat…</div>
            ) : modelChat.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>No recent AI commentary.</div>
            ) : (
              modelChat.map((entry: any) => {
                const isExpanded = expandedChat === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setExpandedChat(isExpanded ? null : entry.id)}
                    className="w-full text-left rounded p-4 space-y-2 transition-colors"
                    style={{
                      background: 'rgba(43, 49, 57, 0.3)',
                      border: '1px solid #2B3139',
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
                          style={{
                            background: '#E781FD',
                            color: '#0B0E11',
                          }}
                        >
                          {getInitials(entry.account_name)}
                        </div>
                        <span className="font-semibold" style={{ color: '#EAECEF' }}>
                          {entry.account_name}
                        </span>
                      </div>
                      <span style={{ color: '#848E9C' }}>{formatDate(entry.decision_time)}</span>
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#EAECEF' }}>
                      {(entry.operation || 'UNKNOWN').toUpperCase()}{' '}
                      {entry.symbol && (
                        <span className="inline-flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold"
                            style={{
                              background: '#2B3139',
                              color: '#EAECEF',
                            }}
                          >
                            {getSymbolInitials(entry.symbol)}
                          </div>
                          {entry.symbol}
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: '#848E9C' }}>
                      {isExpanded
                        ? entry.reason
                        : `${entry.reason?.slice(0, 160) || ''}${entry.reason && entry.reason.length > 160 ? '…' : ''}`}
                    </div>
                    {/* {isExpanded && entry.prompt_snapshot && (
                      <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: '#2B3139' }}>
                        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#848E9C' }}>
                          USER_PROMPT
                        </div>
                        <div className="text-xs p-2 rounded" style={{ background: '#1E2329', color: '#EAECEF' }}>
                          {entry.prompt_snapshot}
                        </div>
                      </div>
                    )} */}
                    {isExpanded && entry.reasoning_snapshot && (
                      <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: '#2B3139' }}>
                        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#848E9C' }}>
                          CHAIN_OF_THOUGHT
                        </div>
                        <div className="text-xs p-2 rounded" style={{ background: '#1E2329', color: '#EAECEF' }}>
                          {entry.reasoning_snapshot}
                        </div>
                      </div>
                    )}
                    {/* {isExpanded && entry.decision_snapshot && (
                      <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: '#2B3139' }}>
                        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#848E9C' }}>
                          TRADING_DECISIONS
                        </div>
                        <div className="text-xs p-2 rounded" style={{ background: '#1E2329', color: '#EAECEF' }}>
                          {entry.decision_snapshot}
                        </div>
                      </div>
                    )} */}
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="p-4 space-y-4">
            {loadingPositions && positions.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>Loading positions…</div>
            ) : positions.length === 0 ? (
              <div className="text-xs" style={{ color: '#848E9C' }}>No open positions.</div>
            ) : (
              positions.map((snapshot: any) => {
                const marginUsageClass =
                  snapshot.margin_usage_percent !== undefined && snapshot.margin_usage_percent !== null
                    ? snapshot.margin_usage_percent >= 75
                      ? '#F6465D'
                      : snapshot.margin_usage_percent >= 50
                      ? '#E781FD'
                      : '#0ECB81'
                    : '#848E9C';
                return (
                  <div
                    key={snapshot.account_id}
                    className="rounded"
                    style={{
                      background: 'rgba(43, 49, 57, 0.5)',
                      border: '1px solid #2B3139',
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: '#2B3139' }}>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#EAECEF' }}>
                          {snapshot.account_name}
                        </div>
                        {snapshot.environment && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide"
                            style={{
                              border: '1px solid #2B3139',
                              color: '#848E9C',
                            }}
                          >
                            {snapshot.environment}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide">
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Total Equity
                          </span>
                          <span className="font-semibold" style={{ color: '#EAECEF' }}>
                            <FlipNumber value={snapshot.total_assets} prefix="$" decimals={2} />
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Available Cash
                          </span>
                          <span className="font-semibold" style={{ color: '#EAECEF' }}>
                            <FlipNumber value={snapshot.available_cash} prefix="$" decimals={2} />
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Used Margin
                          </span>
                          <span className="font-semibold" style={{ color: '#EAECEF' }}>
                            <FlipNumber value={snapshot.used_margin ?? 0} prefix="$" decimals={2} />
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Margin Usage
                          </span>
                          <span className="font-semibold" style={{ color: marginUsageClass }}>
                            {snapshot.margin_usage_percent !== undefined && snapshot.margin_usage_percent !== null
                              ? `${snapshot.margin_usage_percent.toFixed(2)}%`
                              : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Unrealized P&L
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: snapshot.total_unrealized_pnl >= 0 ? '#0ECB81' : '#F6465D' }}
                          >
                            <FlipNumber value={snapshot.total_unrealized_pnl} prefix="$" decimals={2} />
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]" style={{ color: '#848E9C' }}>
                            Total Return
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: snapshot.total_return && snapshot.total_return >= 0 ? '#0ECB81' : '#F6465D' }}
                          >
                            {formatPercent(snapshot.total_return)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {snapshot.positions && snapshot.positions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: '#2B3139' }}>
                          <thead className="bg-muted/50">
                            <tr className="text-[11px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                              <th className="px-4 py-2 text-left">Side</th>
                              <th className="px-4 py-2 text-left">Coin</th>
                              <th className="px-4 py-2 text-left">Size</th>
                              <th className="px-4 py-2 text-left">Entry / Current</th>
                              <th className="px-4 py-2 text-left">Leverage</th>
                              <th className="px-4 py-2 text-left">Margin Used</th>
                              <th className="px-4 py-2 text-left">Notional</th>
                              <th className="px-4 py-2 text-left">Current Value</th>
                              <th className="px-4 py-2 text-left">Unreal P&L</th>
                              <th className="px-4 py-2 text-left">Portfolio %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-xs" style={{ borderColor: '#2B3139', color: '#848E9C' }}>
                            {snapshot.positions.map((position: any, idx: number) => {
                              const leverageLabel =
                                position.leverage && position.leverage > 0 ? `${position.leverage.toFixed(2)}x` : '—';
                              const marginUsed = position.margin_used ?? 0;
                              const roePercent =
                                position.return_on_equity !== undefined && position.return_on_equity !== null
                                  ? position.return_on_equity * 100
                                  : null;
                              const portfolioPercent =
                                position.percentage !== undefined && position.percentage !== null
                                  ? position.percentage * 100
                                  : null;
                              const unrealizedDecimals = Math.abs(position.unrealized_pnl) < 1 ? 4 : 2;
                              return (
                                <tr key={`${position.symbol}-${idx}`}>
                                  <td className="px-4 py-2 font-semibold" style={{ color: '#EAECEF' }}>
                                    {position.side}
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2 font-semibold" style={{ color: '#EAECEF' }}>
                                      <div
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold"
                                        style={{
                                          background: '#2B3139',
                                          color: '#EAECEF',
                                        }}
                                      >
                                        {getSymbolInitials(position.symbol)}
                                      </div>
                                      {position.symbol}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                                      {position.market}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <FlipNumber value={position.quantity} decimals={4} />
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="font-semibold" style={{ color: '#EAECEF' }}>
                                      <FlipNumber value={position.avg_cost} prefix="$" decimals={2} />
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                                      <FlipNumber value={position.current_price} prefix="$" decimals={2} />
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">{leverageLabel}</td>
                                  <td className="px-4 py-2">
                                    <FlipNumber value={marginUsed} prefix="$" decimals={2} />
                                  </td>
                                  <td className="px-4 py-2">
                                    <FlipNumber value={position.notional} prefix="$" decimals={2} />
                                  </td>
                                  <td className="px-4 py-2">
                                    <FlipNumber value={position.current_value} prefix="$" decimals={2} />
                                  </td>
                                  <td
                                    className="px-4 py-2 font-semibold"
                                    style={{ color: position.unrealized_pnl >= 0 ? '#0ECB81' : '#F6465D' }}
                                  >
                                    <div>
                                      <FlipNumber value={position.unrealized_pnl} prefix="$" decimals={unrealizedDecimals} />
                                    </div>
                                    {roePercent !== null && (
                                      <div className="text-[10px] uppercase tracking-wide" style={{ color: '#848E9C' }}>
                                        {roePercent.toFixed(2)}%
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {portfolioPercent !== null ? `${portfolioPercent.toFixed(2)}%` : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs" style={{ color: '#848E9C' }}>
                        No open positions
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

