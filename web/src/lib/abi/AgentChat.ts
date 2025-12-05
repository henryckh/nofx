// AgentChat_V2 ABI - extracted from the contract JSON
export const AGENT_CHAT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'credits', type: 'uint256' },
    ],
    name: 'buy_chat_limit_with_bnb',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'credits', type: 'uint256' },
    ],
    name: 'buy_chat_limit_with_usdc',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'user_chat_limit',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'price_per_limit',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

