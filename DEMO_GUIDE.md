# Demo Guide - Credit System POC

## Quick Demo Setup

This is a **mock/demo version** for investor presentation. Everything works visually but uses localStorage instead of real blockchain transactions.

## What's Implemented (Demo Mode)

### ✅ Working Features

1. **Credit Display Component**
   - Shows current credit balance
   - Warns when credits are low
   - Quick "+100 Credits" button for demo

2. **Credit Purchase UI**
   - Purchase interface (mock)
   - Quick purchase buttons (50, 100, 200, 500 credits)
   - Simulates transaction delay

3. **System Default Option**
   - Added to AI model selection in backtest page
   - Shows credit requirement (1 credit per LLM call)
   - Displays credit balance when selected

4. **Mock Credit System**
   - Uses localStorage to store credits
   - All operations work (add, deduct, check)
   - Perfect for demo without blockchain

## Demo Flow

### 1. Show Wallet Connection (Header)
- **Top right of header**: "Connect Wallet" button (gradient purple style)
- Click to open wallet selection modal with:
  - MetaMask 🦊
  - WalletConnect 🔗
  - Trust Wallet 🔒
  - Binance Wallet 📊
- Select any wallet (simulates connection)
- After connection, shows:
  - Wallet icon with first letter
  - Wallet address (truncated)
  - Current credit balance
  - Professional dropdown with:
    - Full wallet address (copyable)
    - Credit balance with breakdown
    - "Buy More" button
    - "View on BscScan" link
    - Disconnect option

### 2. Show Credit System
Navigate to: `/credits`

- Shows credit balance
- Purchase interface
- Test deduction button

### 3. Show Backtest with Credits
Navigate to: `/backtest`

- Select "System Default (DeepSeek)" from AI Model dropdown
- Credit display appears showing balance
- Shows warning if insufficient credits

### 4. Show System Default in Trade Creation
Navigate to: `/traders` → Create New Trader

- "System Default" option appears at top of AI models list
- Highlighted with blue border
- Shows "No API key needed • 1 credit per call"

### 5. Show Credits in User Profile
- Click user dropdown (if logged in)
- See "💳 Manage Credits" link
- Links to credits page

## Demo Script

1. **Start**: "We've built a subscription system where users can purchase credits and use our system default DeepSeek API without providing their own keys."

2. **Show Wallet Connection (Header)**:
   - Point to "Connect Wallet" button in header (gradient purple, professional look)
   - Click to show wallet selection modal
   - "Users can connect with MetaMask, WalletConnect, Trust Wallet, or Binance Wallet"
   - Select MetaMask (or any option)
   - Show connection animation
   - After connection: "Professional wallet UI showing address, credits, and actions"
   - Click wallet dropdown to show:
     - Full wallet address (copyable)
     - Credit balance with cost breakdown
     - "Buy More" button
     - "View on BscScan" link (real blockchain explorer)
   - "Credits are visible right in the header for easy access"

3. **Show Credits Page**: 
   - Click "Buy More" from wallet dropdown or navigate to `/credits`
   - "Users can purchase credits here"
   - Click "+100 Credits" button
   - "Credits are stored and tracked per wallet"

4. **Show Backtest**:
   - "When users select System Default, they see their credit balance"
   - Select System Default from dropdown
   - "Each LLM call costs 1 credit, automatically deducted"

5. **Show Trade Creation**:
   - "System Default option is available in all AI model selections"
   - "Users don't need to configure API keys"

## Technical Notes for Demo

- **Credits stored in**: `localStorage` (key: `demo_user_credits`)
- **Wallet address**: `demo_wallet` (hardcoded for demo)
- **No blockchain connection**: All transactions are mocked
- **Credit costs**: 1.0 per LLM call, 0.5 per backtest decision

## Production vs Demo

| Feature | Demo | Production |
|---------|------|------------|
| Credit Storage | localStorage | Database + Smart Contract |
| Wallet Connection | Mock | wagmi + BSC Mainnet |
| Purchase | Instant mock | Real blockchain transaction |
| Verification | None | Smart contract verification |

## Files Created for Demo

- `web/src/lib/mockCredits.ts` - Mock credit system
- `web/src/components/CreditDisplay.tsx` - Credit balance display
- `web/src/components/MockCreditPurchase.tsx` - Purchase UI
- `web/src/components/WalletConnection.tsx` - Professional wallet connection UI (RainbowKit-style)
- `web/src/components/DemoCreditsPage.tsx` - Demo page

## Wallet Connection Features

- **Professional UI**: RainbowKit-style wallet selection modal
- **Multiple Wallets**: MetaMask, WalletConnect, Trust Wallet, Binance Wallet
- **Realistic Addresses**: Generates proper 0x... format addresses
- **Copy Functionality**: Click to copy wallet address
- **BscScan Integration**: Link to view wallet on blockchain explorer
- **Credit Display**: Shows balance prominently in dropdown
- **Gradient Styling**: Modern purple gradient design

## Quick Reset

To reset credits for demo:
```javascript
localStorage.removeItem('demo_user_credits')
localStorage.removeItem('demo_wallet_address')
```

Or use browser DevTools → Application → Local Storage → Clear

