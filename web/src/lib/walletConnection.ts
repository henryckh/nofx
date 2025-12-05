import axios from 'axios'

const API_BASE = '/api'

export interface WalletInfo {
  address: string
  chain_id: string
  wallet_type: string
}

export const postConnectWallet = async (walletInfo: WalletInfo) => {
  try {
    const response = await axios.post(
      `${API_BASE}/wallet/connect`,
      walletInfo
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const handleWalletConnect = async (
  account: { address: string },
  chain: { id: number },
  walletClient: { name?: string }
) => {
  if (!account?.address) return false

  const walletInfo: WalletInfo = {
    address: account.address,
    chain_id: chain?.id?.toString() || '',
    wallet_type: walletClient?.name || 'unknown',
  }

  try {
    await postConnectWallet(walletInfo)
    return true
  } catch (error) {
    console.error('Wallet connection error:', error)
    return false
  }
}

