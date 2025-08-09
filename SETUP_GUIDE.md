# 🚀 Millow Setup Guide

## Quick Start (4 Terminals Required)

### Terminal 1: Hardhat Node
```bash
npx hardhat node
```
**Keep this running!** This creates a persistent blockchain.

### Terminal 2: Metadata Server
```bash
node serve-metadata.js
```
**Keep this running!** This serves property metadata.

### Terminal 3: Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Run this **after** Terminal 1 is running.

### Terminal 4: Frontend
```bash
npm start
```
Run this **after** contracts are deployed.

## MetaMask Setup

### Add Network
- **Network Name**: `Hardhat Local`
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: `ETH`

### Import Test Accounts

**Buyer Account:**
```
Private Key: ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Seller Account:**
```
Private Key: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Inspector Account:**
```
Private Key: 5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Lender Account:**
```
Private Key: 7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

## Testing the Buy Function

1. **Connect MetaMask** with the Buyer account
2. **Open** http://localhost:3001 (or whatever port React shows)
3. **Click** on any property
4. **Click** "Buy" button
5. **Confirm** the transaction in MetaMask
6. **Wait** for "Purchase Complete" message

## Troubleshooting

### "Cannot read properties of null (reading 'escrowAmount')"
- Make sure Hardhat node is running (`npx hardhat node`)
- Make sure contracts are deployed to localhost network
- Check MetaMask is connected to the correct network

### "Network Error" or "Connection Refused"
- Restart the Hardhat node
- Redeploy contracts with `--network localhost`
- Refresh the frontend

### Properties Not Loading
- Make sure metadata server is running
- Check browser console for errors
- Verify contract addresses in `src/config.json`

## Success Indicators

✅ **Hardhat Node**: Shows account addresses and "Started HTTP and WebSocket JSON-RPC server"
✅ **Metadata Server**: Shows "Metadata server running on http://localhost:8080"
✅ **Contract Deployment**: Shows contract addresses and "All properties listed on escrow"
✅ **Frontend**: Shows 3 properties in "Homes For You" section
✅ **MetaMask**: Connected to Hardhat Local network with imported accounts