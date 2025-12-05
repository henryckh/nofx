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
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Purchase Credits</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Credits
          </label>
          <input
            type="number"
            min="1"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isProcessing}
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Quick Purchase</div>
          <div className="flex gap-2 flex-wrap">
            {quickPurchaseOptions.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setPurchaseAmount(amount)
                  handlePurchase()
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors disabled:opacity-50"
              >
                {amount} Credits
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Purchase credits using BNB or USDC on BSC Mainnet. 
            Smart contract: 0x921985D83BBDB37170D7F3ccA66fce4ed06B83d7
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing || purchaseAmount <= 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Purchase ${purchaseAmount} Credits`}
        </button>

        <div className="text-xs text-gray-500 text-center">
          Current Balance: {credits.toFixed(1)} credits
        </div>
      </div>
    </div>
  )
}

