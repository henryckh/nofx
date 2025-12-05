import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { api } from '../lib/api'
import { buyChatLimitWithBNB, buyChatLimitWithUSDC, getPricePerLimit } from '../lib/contractInteraction'
import { handleWalletConnect } from '../lib/walletConnection'

const BSC_CHAIN_ID = 56

interface CreditPurchaseProps {
  onPurchaseSuccess?: () => void
}

export function CreditPurchase({ onPurchaseSuccess }: CreditPurchaseProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  
  const [credits, setCredits] = useState(0)
  const [price, setPrice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchaseMethod, setPurchaseMethod] = useState<'bnb' | 'usdc'>('bnb')

  // Connect wallet on mount
  useEffect(() => {
    if (isConnected && address && walletClient) {
      handleWalletConnect({ address }, { id: chainId }, walletClient)
    }
  }, [isConnected, address, chainId, walletClient])

  // Fetch price
  useEffect(() => {
    if (isConnected && walletClient && chainId === BSC_CHAIN_ID) {
      fetchPrice()
    }
  }, [isConnected, walletClient, chainId])

  const fetchPrice = async () => {
    if (!walletClient) return
    
    try {
      setIsLoading(true)
      const pricePerLimit = await getPricePerLimit(walletClient)
      const totalPrice = pricePerLimit * BigInt(credits || 1)
      setPrice(ethers.formatEther(totalPrice))
    } catch (err) {
      console.error('Error fetching price:', err)
      setError('Failed to fetch price')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isConnected || !address || !walletClient) {
      setError('Please connect your wallet first')
      return
    }

    if (chainId !== BSC_CHAIN_ID) {
      switchChain?.({ chainId: BSC_CHAIN_ID })
      return
    }

    if (credits <= 0) {
      setError('Please enter a valid number of credits')
      return
    }

    try {
      setIsPurchasing(true)
      setError(null)

      let txHash: string
      if (purchaseMethod === 'bnb') {
        txHash = await buyChatLimitWithBNB(credits, walletClient)
      } else {
        txHash = await buyChatLimitWithUSDC(credits, walletClient)
      }

      // Notify backend about the purchase
      await api.purchaseCredits(address, credits, txHash)
      
      onPurchaseSuccess?.()
      setCredits(0)
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.message || 'Failed to purchase credits')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">Please connect your wallet to purchase credits</p>
      </div>
    )
  }

  if (chainId !== BSC_CHAIN_ID) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <p className="text-sm text-yellow-800 mb-2">
          Please switch to BSC Mainnet to purchase credits
        </p>
        <button
          onClick={() => switchChain?.({ chainId: BSC_CHAIN_ID })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Switch Network
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Purchase Credits</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Credits
          </label>
          <input
            type="number"
            min="1"
            value={credits}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0
              setCredits(val)
              if (val > 0) fetchPrice()
            }}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isPurchasing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Payment Method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="bnb"
                checked={purchaseMethod === 'bnb'}
                onChange={(e) => setPurchaseMethod(e.target.value as 'bnb')}
                className="mr-2"
              />
              BNB
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="usdc"
                checked={purchaseMethod === 'usdc'}
                onChange={(e) => setPurchaseMethod(e.target.value as 'usdc')}
                className="mr-2"
              />
              USDC
            </label>
          </div>
        </div>

        {price && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm">
              <span className="font-medium">Total Price:</span> {price} {purchaseMethod === 'bnb' ? 'BNB' : 'USDC'}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={isPurchasing || credits <= 0 || isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPurchasing ? 'Processing...' : 'Purchase Credits'}
        </button>
      </div>
    </div>
  )
}

