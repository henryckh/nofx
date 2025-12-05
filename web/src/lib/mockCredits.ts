// Credit system - uses localStorage for demo mode
// In production, this would connect to backend API and smart contract

const CREDITS_STORAGE_KEY = 'user_credits'
const WALLET_STORAGE_KEY = 'wallet_address'

export interface MockCredits {
  wallet_address: string
  credits: number
  updated_at: string
}

// Initialize credits for a wallet address
export function initMockCredits(walletAddress: string): MockCredits {
  // Validate address format (0x + 40 hex chars)
  if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
    console.warn('Invalid wallet address format:', walletAddress)
    return {
      wallet_address: walletAddress.toLowerCase(),
      credits: 0,
      updated_at: new Date().toISOString(),
    }
  }

  const existing = getMockCredits(walletAddress)
  if (existing) {
    return existing
  }

  const credits: MockCredits = {
    wallet_address: walletAddress.toLowerCase(),
    credits: 0,
    updated_at: new Date().toISOString(),
  }
  
  localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits))
  localStorage.setItem(WALLET_STORAGE_KEY, walletAddress.toLowerCase())
  return credits
}

// Get credits for wallet address
export function getMockCredits(walletAddress?: string): MockCredits | null {
  const stored = localStorage.getItem(CREDITS_STORAGE_KEY)
  if (!stored) return null

  const credits: MockCredits = JSON.parse(stored)
  
  // If wallet address provided, check if it matches
  if (walletAddress && credits.wallet_address !== walletAddress.toLowerCase()) {
    return null
  }

  return credits
}

// Add credits to wallet
export function addMockCredits(amount: number): MockCredits {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY)
  const walletAddress = stored || '0x0000000000000000000000000000000000000000'
  const credits = getMockCredits(walletAddress) || initMockCredits(walletAddress)
  credits.credits += amount
  credits.updated_at = new Date().toISOString()
  
  localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits))
  return credits
}

// Deduct mock credits
export function deductMockCredits(amount: number): { success: boolean; remaining: number } {
  const credits = getMockCredits()
  if (!credits) {
    return { success: false, remaining: 0 }
  }

  if (credits.credits < amount) {
    return { success: false, remaining: credits.credits }
  }

  credits.credits -= amount
  credits.updated_at = new Date().toISOString()
  localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits))
  
  return { success: true, remaining: credits.credits }
}

// Check if has enough credits
export function hasEnoughCredits(amount: number): boolean {
  const credits = getMockCredits()
  return credits ? credits.credits >= amount : false
}

// Reset credits (for testing)
export function resetMockCredits() {
  localStorage.removeItem(CREDITS_STORAGE_KEY)
  localStorage.removeItem(WALLET_STORAGE_KEY)
}

