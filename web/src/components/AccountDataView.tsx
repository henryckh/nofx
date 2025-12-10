import { useEffect, useMemo, useState } from 'react';
import type { CompetitionData } from '../types';
import { FlipNumber } from './FlipNumber';
import { AssetCurve } from './AssetCurve';
import { ArenaFeed } from './ArenaFeed';

interface AccountDataViewProps {
  competition?: CompetitionData | null;
  showChart?: boolean;
}

const SUPPORTED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AIO'] as const;
const SYMBOL_ICONS = {
  'BTC': '/icons/btc.svg',
  'ETH': '/icons/eth.png',
  'SOL': '/icons/sol.svg',
  'BNB': '/icons/bnb.svg',
  'AIO': '/icons/aio.png',
}

export function AccountDataView({ competition }: AccountDataViewProps) {
  const [marketValues, setMarketValues] = useState<Record<string, number>>(
    Object.fromEntries(SUPPORTED_SYMBOLS.map(symbol => [symbol, 0]))
  );

  useEffect(() => {
    const ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');

    ws.onopen = () => {
      // Subscribe to price updates for supported symbols
      SUPPORTED_SYMBOLS.forEach(symbol => {
        ws.send(JSON.stringify({
          op: 'subscribe',
          args: [`tickers.${symbol}USDT`]
        }));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.data.markPrice) {
        const symbol = data.topic.split('.')[1];
        setMarketValues(prevValues => ({
          ...prevValues,
          [symbol]: data.data.markPrice
        }));
      }
    };

    return () => {
      // Cleanup
      ws.close();
    };
  }, []);

  const showTotal = false;
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

    const totalInitialEquity = totals.totalEquity - totals.totalPnL;
    totals.totalPnLPct = totalInitialEquity > 0 ? (totals.totalPnL / totalInitialEquity) * 100 : 0;

    const avgMarginUsedPct =
      competition.traders.reduce((sum, t) => sum + (t.margin_used_pct || 0), 0) /
      competition.traders.length;
    totals.totalMarginUsed = avgMarginUsedPct;

    return totals;
  }, [competition]);

  // Position Summaries using marketValues
  const positionSummaries = useMemo(() => {
    return SUPPORTED_SYMBOLS.map((symbol) => ({
      symbol,
      marketValue: marketValues[symbol.replace('USDT', '')] || 0,
    }));
  }, [marketValues]);

  return (
    <div className="space-y-5">
      <div className="binance-card p-4 md:p-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
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
                    <img src={SYMBOL_ICONS[position.symbol]} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span
                      className="text-[11px] uppercase tracking-wide"
                      style={{ color: '#848E9C' }}
                    >
                      {position.symbol}
                    </span>
                    <div className="text-sm font-semibold" style={{ color: 'white' }}>
                      {marketValues[`${position.symbol}USDT`] && <FlipNumber
                        value={marketValues[`${position.symbol}USDT`]}
                        prefix="$"
                        decimals={2}
                      />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showTotal && <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide">
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
          </div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="binance-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#EAECEF' }}>
              Alpha Arena
            </h2>
            <p className="text-xs" style={{ color: '#848E9C' }}>
              Real-time equity tracking for all AIs
            </p>
          </div>
          <div className="min-h-[400px]">
            <AssetCurve timeframe="5m" tradingMode="paper" />
          </div>
        </div>

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
    </div>
  );
}