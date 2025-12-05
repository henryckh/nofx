import { useState, useEffect } from 'react'
import { getMockCredits, addMockCredits, hasEnoughCredits } from '../lib/mockCredits'

interface CreditDisplayProps {
  walletAddress?: string
  requiredCredits?: number
  onInsufficientCredits?: () => void
}

export function CreditDisplay({ 
  walletAddress, 
  requiredCredits,
  onInsufficientCredits 
}: CreditDisplayProps) {
  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCredits()
    // Refresh every 5 seconds
    const interval = setInterval(loadCredits, 5000)
    return () => clearInterval(interval)
  }, [walletAddress])

  const loadCredits = () => {
    const mockCredits = getMockCredits(walletAddress)
    setCredits(mockCredits?.credits || 0)
    setIsLoading(false)

    // Check if insufficient credits
    if (requiredCredits && mockCredits) {
      if (!hasEnoughCredits(requiredCredits)) {
        onInsufficientCredits?.()
      }
    }
  }

  const handleQuickAdd = () => {
    addMockCredits(100)
    loadCredits()
  }

  if (isLoading) {
    return (
      <div className="px-3 py-2 rounded text-sm" style={{ 
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        color: 'var(--text-secondary)'
      }}>
        Loading credits...
      </div>
    )
  }

  const hasEnough = requiredCredits ? hasEnoughCredits(requiredCredits) : true
  const isLow = credits < (requiredCredits || 10)

  return (
    <div className="px-4 py-3 rounded-lg" style={{
      background: isLow ? 'rgba(234, 179, 8, 0.1)' : 'rgba(14, 203, 129, 0.1)',
      border: `1px solid ${isLow ? 'rgba(234, 179, 8, 0.3)' : 'rgba(14, 203, 129, 0.3)'}`
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Available Credits
          </div>
          <div className="text-2xl font-bold" style={{
            color: isLow ? '#EAB308' : '#0ECB81'
          }}>
            {credits.toFixed(1)}
          </div>
          {requiredCredits && (
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Required: {requiredCredits.toFixed(1)} credits
              {!hasEnough && (
                <span className="ml-2" style={{ color: '#F6465D' }}>⚠️ Insufficient</span>
              )}
            </div>
          )}
        </div>
        <a
          href="/credits"
          className="px-3 py-1.5 text-xs rounded font-semibold transition-all text-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Buy Credits
        </a>
      </div>
    </div>
  )
}

