# Subscription System Implementation

This document describes the subscription/credit system implementation for nofx-aio.

## Overview

The subscription system allows users to:
1. Connect their wallet (BSC Mainnet)
2. Purchase credits using BNB or USDC via smart contract
3. Use system default DeepSeek API key (no need to provide their own)
4. Credits are automatically deducted for LLM calls, backtests, and trades

## Smart Contract

- **Address**: `0x921985D83BBDB37170D7F3ccA66fce4ed06B83d7`
- **Network**: BSC Mainnet (Chain ID: 56)
- **Contract**: AgentChat_V2

## Credit Costs

- **LLM Call**: 1.0 credits per call
- **Backtest Decision**: 0.5 credits per decision
- **Live Trade Decision**: 1.0 credits per decision

## Backend Implementation

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS user_credits (
    wallet_address TEXT PRIMARY KEY,
    credits REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

1. **POST /api/wallet/connect** - Connect wallet
2. **GET /api/credits/:wallet_address** - Get user credits
3. **POST /api/credits/deduct** - Deduct credits
4. **POST /api/credits/purchase** - Purchase credits (after smart contract transaction)
5. **GET /api/credits/check/:wallet_address/:amount** - Check if user has enough credits

### System Default Provider

- Provider name: `system_default` or `system`
- Uses system-configured DeepSeek API key (from `system_default_deepseek_api_key` config or `DEEPSEEK_API_KEY` env var)
- Users don't need to provide their own API key
- Credits are automatically deducted when using this provider

## Frontend Implementation

### New Files Created

1. **`web/src/lib/walletConnection.ts`** - Wallet connection utilities
2. **`web/src/lib/contractInteraction.ts`** - Smart contract interaction functions
3. **`web/src/lib/abi/AgentChat.ts`** - Contract ABI
4. **`web/src/components/CreditPurchase.tsx`** - Credit purchase UI component

### Dependencies Added

- `wagmi` - Wallet connection library
- `viem` - Ethereum library (wagmi dependency)
- `ethers` - Ethereum utilities

## Configuration

### System Default DeepSeek API Key

Set via one of:
1. Database config: `system_default_deepseek_api_key`
2. Environment variable: `DEEPSEEK_API_KEY`

### Usage in Backtest/Trade Config

Set `ai.provider` to `"system_default"` or `"system"` to use the system default API key.

## Demo Implementation (POC Ready) ✅

For investor demo, a **mock version** has been implemented:

1. ✅ **Mock Credit System** (`web/src/lib/mockCredits.ts`)
   - Uses localStorage for demo
   - All operations work (add, deduct, check)
   - Perfect for presentation without blockchain

2. ✅ **Credit Display UI** (`web/src/components/CreditDisplay.tsx`)
   - Shows credit balance
   - Warns when low
   - Quick add button for demo

3. ✅ **Credit Purchase UI** (`web/src/components/MockCreditPurchase.tsx`)
   - Purchase interface
   - Quick purchase options
   - Simulates transaction

4. ✅ **System Default Option**
   - Added to AI model selection in backtest page
   - Added to traders page AI models section
   - Shows credit requirement

5. ✅ **Demo Credits Page** (`/credits` route)
   - Full credit management interface
   - Test deduction functionality

## Production Next Steps (After Demo)

1. **Add credit deduction to LLM calls**: Update the MCP client calls to deduct credits before making API calls
2. **Add wagmi provider setup**: Configure wagmi in the main app component
3. **Add credit deduction middleware**: Create middleware to check and deduct credits before LLM calls
4. **Add transaction verification**: Verify smart contract transactions before adding credits
5. **Replace mock with real**: Switch from localStorage to database + smart contract

## Testing

1. Test wallet connection
2. Test credit purchase flow
3. Test credit deduction
4. Test system default provider
5. Test insufficient credits handling

## Notes

- Credits are stored per wallet address (normalized to lowercase)
- All credit operations are logged for audit purposes
- The system uses SQLite's ON CONFLICT for atomic credit updates

## Demo Mode

For the investor POC, a mock implementation is available:
- **Storage**: localStorage (instead of database)
- **Transactions**: Mocked (instead of blockchain)
- **Wallet**: Hardcoded "demo_wallet" (instead of real connection)

See `DEMO_GUIDE.md` for demo instructions.

