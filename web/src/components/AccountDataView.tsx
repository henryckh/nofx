import { useMemo } from 'react';
import type { CompetitionData } from '../types';
import { FlipNumber } from './FlipNumber';
import { AssetCurve } from './AssetCurve';
import { ArenaFeed } from './ArenaFeed';

interface AccountDataViewProps {
  competition: CompetitionData | null;
  showChart?: boolean;
}

const SUPPORTED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'] as const;

export function AccountDataView({ competition, showChart = true }: AccountDataViewProps) {
  const aggregatedTotals = useMemo(() => {
    if (!competition || !competition.traders || competition.traders.length === 0) {
      return {
        totalEquity: 0,
        totalPnL: 0,
        totalPnLPct: 0,
        totalPositions: 0,
        totalMarginUsed: 0,
      };
    }

    const totals = competition.traders.reduce(
      (acc, trader) => {
        acc.totalEquity += trader.total_equity || 0;
        acc.totalPnL += trader.total_pnl || 0;
        acc.totalPositions += trader.position_count || 0;
        return acc;
      },
      {
        totalEquity: 0,
        totalPnL: 0,
        totalPnLPct: 0,
        totalPositions: 0,
        totalMarginUsed: 0,
      }
    );

    // Calculate average PnL percentage (weighted by equity)
    const totalInitialEquity = totals.totalEquity - totals.totalPnL;
    totals.totalPnLPct = totalInitialEquity > 0 ? (totals.totalPnL / totalInitialEquity) * 100 : 0;

    // Calculate average margin used percentage
    const avgMarginUsedPct =
      competition.traders.reduce((sum, t) => sum + (t.margin_used_pct || 0), 0) /
      competition.traders.length;
    totals.totalMarginUsed = avgMarginUsedPct;

    return totals;
  }, [competition]);

  // For now, we'll show placeholder position summaries since competition data doesn't include symbol breakdowns
  // In the future, this could be enhanced to fetch position data separately
  const positionSummaries = useMemo(() => {
    // Return empty summaries for now - can be enhanced later with actual position data
    return SUPPORTED_SYMBOLS.map((symbol) => ({
      symbol,
      marketValue: 0,
    }));
  }, []);

  return (
    <div className="space-y-5">
      {/* Summary Section */}
      <div className="binance-card p-4 md:p-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Position Summaries */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {positionSummaries.map((position) => (
                <div
                  key={position.symbol}
                  className="flex items-center gap-3 rounded-md px-3 py-2 shadow-sm border flex-shrink-0 w-[140px] md:w-[160px]"
                  style={{
                    background: 'rgba(43, 49, 57, 0.5)',
                    borderColor: '#2B3139',
                  }}
                >
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-semibold"
                    style={{
                      background: 'rgba(43, 49, 57, 0.8)',
                      color: '#848E9C',
                    }}
                  >
                    {position.symbol.slice(0, 4).toUpperCase()}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span
                      className="text-[11px] uppercase tracking-wide"
                      style={{ color: '#848E9C' }}
                    >
                      {position.symbol}
                    </span>
                    <div className="text-sm font-semibold" style={{ color: '#F0B90B' }}>
                      <FlipNumber
                        value={position.marketValue}
                        prefix="$"
                        decimals={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide">
            <div className="flex flex-col leading-tight">
              <span style={{ color: '#848E9C' }}>Total Equity</span>
              <div className="text-base font-semibold" style={{ color: '#EAECEF' }}>
                <FlipNumber
                  value={aggregatedTotals.totalEquity}
                  prefix="$"
                  decimals={2}
                />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span style={{ color: '#848E9C' }}>Total P&L</span>
              <div
                className="text-base font-semibold"
                style={{
                  color: aggregatedTotals.totalPnL >= 0 ? '#0ECB81' : '#F6465D',
                }}
              >
                <FlipNumber
                  value={aggregatedTotals.totalPnL}
                  prefix="$"
                  decimals={2}
                />
              </div>
              <div
                className="text-xs mt-0.5"
                style={{
                  color: aggregatedTotals.totalPnLPct >= 0 ? '#0ECB81' : '#F6465D',
                }}
              >
                {aggregatedTotals.totalPnLPct >= 0 ? '+' : ''}
                {aggregatedTotals.totalPnLPct.toFixed(2)}%
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span style={{ color: '#848E9C' }}>Positions</span>
              <div className="text-base font-semibold" style={{ color: '#EAECEF' }}>
                {aggregatedTotals.totalPositions}
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span style={{ color: '#848E9C' }}>Margin Used</span>
              <div className="text-base font-semibold" style={{ color: '#EAECEF' }}>
                {aggregatedTotals.totalMarginUsed.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Feed Section */}
      {showChart && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart Section */}
          <div className="binance-card p-4 md:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#EAECEF' }}>
                Asset Curve
              </h2>
              <p className="text-xs" style={{ color: '#848E9C' }}>
                Real-time equity tracking for all traders
              </p>
            </div>
            <div className="min-h-[400px]">
              <AssetCurve timeframe="5m" tradingMode="paper" />
            </div>
          </div>

          {/* Arena Feed Section */}
          <div className="binance-card p-4 md:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#EAECEF' }}>
                Trading Activity
              </h2>
              <p className="text-xs" style={{ color: '#848E9C' }}>
                Completed trades, model chat, and positions
              </p>
            </div>
            <div className="min-h-[400px]">
              <ArenaFeed tradingMode="paper" accountId="all" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

