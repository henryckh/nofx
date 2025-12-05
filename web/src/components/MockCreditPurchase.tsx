import { useState, useEffect } from 'react'
import { getMockCredits, addMockCredits } from '../lib/mockCredits'

interface MockCreditPurchaseProps {
  walletAddress?: string
  onPurchaseSuccess?: () => void
}

export function MockCreditPurchase({ 
  walletAddress, 
  onPurchaseSuccess 
}: MockCreditPurchaseProps) {
  const [credits, setCredits] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseAmount, setPurchaseAmount] = useState(100)

  useEffect(() => {
    loadCredits()
  }, [walletAddress])

  const loadCredits = () => {
    const mockCredits = getMockCredits(walletAddress)
    setCredits(mockCredits?.credits || 0)
  }

  const handlePurchase = async () => {
    setIsProcessing(true)
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add credits
    addMockCredits(purchaseAmount)
    loadCredits()
    
    setIsProcessing(false)
    onPurchaseSuccess?.()
  }

  const quickPurchaseOptions = [50, 100, 200, 500]

  return (
    <div 
      className="p-6 rounded-lg binance-card"
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
            Number of Credits
          </label>
          <input
            type="number"
            min="1"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--background-elevated)',
              border: '1px solid var(--panel-border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-accent)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(231, 129, 253, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--panel-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            disabled={isProcessing}
          />
        </div>

        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            Quick Purchase
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickPurchaseOptions.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setPurchaseAmount(amount)
                  handlePurchase()
                }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: purchaseAmount === amount 
                    ? 'rgba(231, 129, 253, 0.2)' 
                    : 'var(--background-elevated)',
                  border: `1px solid ${purchaseAmount === amount 
                    ? 'var(--brand-accent)' 
                    : 'var(--panel-border)'}`,
                  color: purchaseAmount === amount 
                    ? 'var(--brand-accent)' 
                    : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (purchaseAmount !== amount) {
                    e.currentTarget.style.background = 'var(--panel-bg-hover)'
                    e.currentTarget.style.borderColor = 'var(--panel-border-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (purchaseAmount !== amount) {
                    e.currentTarget.style.background = 'var(--background-elevated)'
                    e.currentTarget.style.borderColor = 'var(--panel-border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {amount} Credits
              </button>
            ))}
          </div>
        </div>

        <div 
          className="p-4 rounded-lg"
          style={{
            background: 'rgba(126, 90, 255, 0.1)',
            border: '1px solid rgba(126, 90, 255, 0.2)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Purchase credits using BNB or USDC on BSC Mainnet.
            <br />
            <span className="font-mono text-xs mt-1 block" style={{ color: 'var(--brand-accent)' }}>
              Smart contract: 0x921985D83BBDB37170D7F3ccA66fce4ed06B83d7
            </span>
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing || purchaseAmount <= 0}
          className="w-full px-4 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isProcessing || purchaseAmount <= 0
              ? 'var(--panel-bg)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: isProcessing || purchaseAmount <= 0
              ? '1px solid var(--panel-border)'
              : 'none',
            color: isProcessing || purchaseAmount <= 0
              ? 'var(--text-disabled)'
              : '#fff',
            boxShadow: isProcessing || purchaseAmount <= 0
              ? 'none'
              : '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing && purchaseAmount > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing && purchaseAmount > 0) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }
          }}
        >
          {isProcessing ? 'Processing...' : `Purchase ${purchaseAmount} Credits`}
        </button>

        <div 
          className="text-sm text-center pt-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Current Balance: <strong style={{ color: 'var(--text-primary)' }}>{credits.toFixed(1)} credits</strong>
        </div>
      </div>
    </div>
  )
}

