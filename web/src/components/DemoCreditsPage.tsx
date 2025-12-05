import { useState, useEffect } from 'react'
import { CreditDisplay } from './CreditDisplay'
import { MockCreditPurchase } from './MockCreditPurchase'
import { getMockCredits, initMockCredits, deductMockCredits } from '../lib/mockCredits'

export function DemoCreditsPage() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('wallet_address')
    if (stored) {
      setWalletAddress(stored)
      initMockCredits(stored)
      loadCredits()
    }
  }, [])

  const loadCredits = () => {
    if (!walletAddress) return
    const mockCredits = getMockCredits(walletAddress)
    setCredits(mockCredits?.credits || 0)
  }

  useEffect(() => {
    if (walletAddress) {
      loadCredits()
    }
  }, [walletAddress])

  const handleTestDeduction = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }
    const result = deductMockCredits(1.0)
    if (result.success) {
      alert(`Deducted 1 credit! Remaining: ${result.remaining}`)
      loadCredits()
    } else {
      alert(`Insufficient credits! Current: ${result.remaining}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!walletAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-blue-800">
            Please connect your wallet from the header to view and manage your credits.
          </p>
        </div>
      )}

      {walletAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Credits</h3>
            <CreditDisplay walletAddress={walletAddress} />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Credit Costs:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• LLM Call: 1.0 credits</li>
              <li>• Backtest Decision: 0.5 credits</li>
              <li>• Live Trade Decision: 1.0 credits</li>
            </ul>
          </div>

          <button
            onClick={handleTestDeduction}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test: Deduct 1 Credit
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Purchase Credits</h3>
          <MockCreditPurchase 
            walletAddress={walletAddress}
            onPurchaseSuccess={loadCredits}
          />
        </div>
        </div>
      )}

      {walletAddress && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">How It Works:</h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Connect your wallet (BSC Mainnet)</li>
            <li>Purchase credits using BNB or USDC via smart contract</li>
            <li>Select "System Default" in backtest/trade pages</li>
            <li>Credits are automatically deducted per LLM call</li>
            <li>No need to provide your own API keys!</li>
          </ol>
        </div>
      )}
    </div>
  )
}

