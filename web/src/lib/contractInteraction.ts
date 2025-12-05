import { ethers, BrowserProvider } from 'ethers'
import { AGENT_CHAT_ABI } from './abi/AgentChat'

// BSC Mainnet contract address
const AGENT_CHAT_ADDRESS = '0x921985D83BBDB37170D7F3ccA66fce4ed06B83d7'

export interface BuyChatLimitParams {
  credits: number
  walletClient: any
}

export interface UserChatLimit {
  totalSpendableCredits: number
  remainingCredits: number
}

/**
 * Get user chat limit from smart contract
 */
export async function getUserChatLimit(
  walletAddress: string,
  walletClient: any
): Promise<UserChatLimit> {
  if (!walletClient) {
    throw new Error('Wallet not connected')
  }

  try {
    const provider = new BrowserProvider(walletClient)
    const contract = new ethers.Contract(
      AGENT_CHAT_ADDRESS,
      AGENT_CHAT_ABI,
      provider
    )

    const limit = await contract.user_chat_limit(walletAddress)
    const credits = Number(ethers.formatUnits(limit, 0))

    return {
      totalSpendableCredits: credits,
      remainingCredits: credits,
    }
  } catch (error) {
    console.error('Error getting user chat limit:', error)
    throw error
  }
}

/**
 * Buy chat limit with BNB
 */
export async function buyChatLimitWithBNB(
  credits: number,
  walletClient: any
): Promise<string> {
  if (!walletClient) {
    throw new Error('Wallet not connected')
  }

  try {
    const provider = new BrowserProvider(walletClient)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      AGENT_CHAT_ADDRESS,
      AGENT_CHAT_ABI,
      signer
    )

    // Get price per limit from contract
    const pricePerLimit = await contract.price_per_limit()
    const totalPrice = pricePerLimit * BigInt(credits)

    // Execute transaction
    const tx = await contract.buy_chat_limit_with_bnb(credits, {
      value: totalPrice,
    })

    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error buying chat limit with BNB:', error)
    throw error
  }
}

/**
 * Buy chat limit with USDC
 */
export async function buyChatLimitWithUSDC(
  credits: number,
  walletClient: any
): Promise<string> {
  if (!walletClient) {
    throw new Error('Wallet not connected')
  }

  try {
    const provider = new BrowserProvider(walletClient)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      AGENT_CHAT_ADDRESS,
      AGENT_CHAT_ABI,
      signer
    )

    // Execute transaction
    const tx = await contract.buy_chat_limit_with_usdc(credits)
    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Error buying chat limit with USDC:', error)
    throw error
  }
}

/**
 * Get price per limit from contract
 */
export async function getPricePerLimit(
  walletClient: any
): Promise<bigint> {
  if (!walletClient) {
    throw new Error('Wallet not connected')
  }

  try {
    const provider = new BrowserProvider(walletClient)
    const contract = new ethers.Contract(
      AGENT_CHAT_ADDRESS,
      AGENT_CHAT_ABI,
      provider
    )

    return await contract.price_per_limit()
  } catch (error) {
    console.error('Error getting price per limit:', error)
    throw error
  }
}

