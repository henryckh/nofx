import { useState, useEffect } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink, Check } from 'lucide-react'
import { getMockCredits, initMockCredits } from '../lib/mockCredits'



interface WalletConnectionProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

export function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [credits, setCredits] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Check for existing connection
  useEffect(() => {
    const stored = localStorage.getItem('wallet_address')
    
    // Validate stored address is proper format (0x + 40 hex chars)
    // Also check for old demo_wallet format and clear it
    if (stored && stored.startsWith('0x') && stored.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(stored)) {
      setWalletAddress(stored)
      setIsConnected(true)
      initMockCredits(stored)
      loadCredits()
      onConnect?.(stored)
    } else {
      // Clear invalid or old demo addresses
      if (stored) {
        localStorage.removeItem('wallet_address')
        localStorage.removeItem('wallet_name')
        // Also clear old demo keys
        localStorage.removeItem('demo_wallet_address')
        localStorage.removeItem('demo_wallet_name')
      }
    }
  }, [])

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadCredits()
      const interval = setInterval(loadCredits, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, walletAddress])

  const loadCredits = () => {
    const mockCredits = getMockCredits(walletAddress)
    setCredits(mockCredits?.credits || 0)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress('')
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('wallet_name')
    onDisconnect?.()
    setShowDropdown(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (addr: string) => {
    if (!addr || !addr.startsWith('0x')) return ''
    // Show 0x + first 4 hex chars, then ***, then last 4 hex chars
    // Example: 0x742d***bEb (realistic wallet format)
    if (addr.length === 42) {
      return `${addr.slice(0, 6)}***${addr.slice(-4)}`
    }
    return addr
  }

  const getWalletName = () => {
    return localStorage.getItem('wallet_name') || 'Wallet'
  }

  const handleQuickConnect = async () => {
    if (isConnecting) return
    setIsConnecting(true)
    
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Generate a realistic wallet address (0x + 40 hex characters, mixed case for checksum)
    const hexChars = '0123456789abcdef'
    const address = '0x' + Array.from({ length: 40 }, () => {
      const char = hexChars[Math.floor(Math.random() * 16)]
      // Randomly uppercase some characters for realistic checksum format
      return Math.random() > 0.5 ? char.toUpperCase() : char
    }).join('')
    
    // Use MetaMask as default
    const walletName = 'MetaMask'
    
    setWalletAddress(address)
    setIsConnected(true)
    localStorage.setItem('wallet_address', address)
    localStorage.setItem('wallet_name', walletName)
    initMockCredits(address)
    loadCredits()
    onConnect?.(address)
    setIsConnecting(false)
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleQuickConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          if (!isConnecting) {
            e.currentTarget.style.transform = 'scale(1.02)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </button>
    )
  }


  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--panel-bg)'
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
          }}
        >
          {getWalletName()[0]}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {formatAddress(walletAddress)}
          </div>
          <div className="text-sm font-semibold flex items-center gap-1" style={{ color: '#0ECB81' }}>
            <span>{credits.toFixed(1)}</span>
            <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
              Credits
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              background: 'var(--brand-dark-gray)',
              border: '1px solid var(--panel-border)',
            }}
          >
            {/* Wallet Info Header */}
            <div
              className="px-4 py-4 border-b"
              style={{ borderColor: 'var(--panel-border)', background: 'rgba(102, 126, 234, 0.1)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                  }}
                >
                  {getWalletName()[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--brand-light-gray)' }}>
                    {getWalletName()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Connected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 px-3 py-2 rounded-lg font-mono text-xs" style={{ 
                  background: 'rgba(0, 0, 0, 0.2)',
                  color: 'var(--brand-light-gray)',
                }}>
                  {walletAddress.length === 42 
                    ? `${walletAddress.slice(0, 8)}***${walletAddress.slice(-6)}`
                    : walletAddress}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--brand-light-gray)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Credits Section */}
            <div
              className="px-4 py-4 border-b"
              style={{ borderColor: 'var(--panel-border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Available Credits
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#0ECB81' }}>
                    {credits.toFixed(1)}
                  </div>
                </div>
                <a
                  href="/credits"
                  className="px-4 py-2 text-xs rounded-lg font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                  }}
                  onClick={() => setShowDropdown(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  Buy More
                </a>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div>• LLM Call: 1.0 credits</div>
                <div>• Backtest: 0.5 credits/decision</div>
                <div>• Trade: 1.0 credits/decision</div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <a
                href={`https://bscscan.com/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-2"
                style={{ color: 'var(--brand-light-gray)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <ExternalLink className="w-4 h-4" />
                View on BscScan
              </a>
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                style={{
                  background: 'var(--binance-red-bg)',
                  color: 'var(--binance-red)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <Wallet className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
