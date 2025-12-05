import { useState, useEffect } from 'react'
import { CreditDisplay } from './CreditDisplay'
import { MockCreditPurchase } from './MockCreditPurchase'
import { initMockCredits, deductMockCredits } from '../lib/mockCredits'

export function DemoCreditsPage() {
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem('wallet_address')
    if (stored) {
      setWalletAddress(stored)
      initMockCredits(stored)
    }
  }, [])

  const handleTestDeduction = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }
    const result = deductMockCredits(1.0)
    if (result.success) {
      alert(`Deducted 1 credit! Remaining: ${result.remaining}`)
    } else {
      alert(`Insufficient credits! Current: ${result.remaining}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {!walletAddress && (
        <div 
          className="binance-card p-6"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Connect Your Wallet
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Please connect your wallet from the header to view and manage your credits.
          </p>
        </div>
      )}

      {walletAddress && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Credits Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Your Credits
              </h2>
              
              <CreditDisplay walletAddress={walletAddress} />
            
              <div 
                className="p-5 rounded-lg"
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Credit Costs:
                </h4>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <span style={{ color: 'var(--brand-accent)' }}>•</span>
                    <span>LLM Call: <strong style={{ color: 'var(--text-primary)' }}>1.0 credits</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: 'var(--brand-accent)' }}>•</span>
                    <span>Backtest Decision: <strong style={{ color: 'var(--text-primary)' }}>0.5 credits</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: 'var(--brand-accent)' }}>•</span>
                    <span>Live Trade Decision: <strong style={{ color: 'var(--text-primary)' }}>1.0 credits</strong></span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleTestDeduction}
                className="w-full px-4 py-2.5 rounded-lg font-semibold transition-all"
                style={{
                  background: 'rgba(255, 107, 127, 0.15)',
                  border: '1px solid rgba(255, 107, 127, 0.3)',
                  color: 'var(--binance-red)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 127, 0.25)'
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 127, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 127, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 127, 0.3)'
                }}
              >
                Test: Deduct 1 Credit
              </button>
            </div>

            {/* Purchase Credits Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Purchase Credits
              </h2>
              <MockCreditPurchase 
                walletAddress={walletAddress}
                onPurchaseSuccess={() => {}}
              />
            </div>
          </div>

          {/* How It Works Section */}
          <div 
            className="p-6 rounded-lg"
            style={{
              background: 'rgba(231, 129, 253, 0.08)',
              border: '1px solid rgba(231, 129, 253, 0.2)',
            }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--brand-accent)' }}>
              How It Works:
            </h3>
            <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li style={{ color: 'var(--text-primary)' }}>Connect your wallet (BSC Mainnet)</li>
              <li style={{ color: 'var(--text-primary)' }}>Purchase credits using BNB or USDC via smart contract</li>
              <li style={{ color: 'var(--text-primary)' }}>Select "System Default" in backtest/trade pages</li>
              <li style={{ color: 'var(--text-primary)' }}>Credits are automatically deducted per LLM call</li>
              <li style={{ color: 'var(--text-primary)' }}>No need to provide your own API keys!</li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}

