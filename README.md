# Millow - Real Estate Escrow DApp

A decentralized real estate marketplace built with React, Solidity, and Hardhat.

## Features

- **NFT-based Property Ownership**: Each property is represented as an ERC721 NFT
- **Escrow System**: Secure transactions with multi-party approval
- **Role-based Access**: Different roles for buyers, sellers, inspectors, and lenders
- **MetaMask Integration**: Connect your wallet to interact with properties
- **Responsive UI**: Modern React interface with property listings

## Smart Contracts

### RealEstate.sol
- ERC721 NFT contract for property tokens
- Minting and ownership management

### Escrow.sol
- Handles property transactions
- Manages deposits, approvals, and transfers
- Multi-party approval system (buyer, seller, inspector, lender)

## Getting Started

### Prerequisites
- Node.js (v14, v16, or v18 recommended)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd millow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

4. **Run tests**
   ```bash
   npx hardhat test
   ```

### Development Setup

#### Option 1: Using Hardhat Network (Recommended for testing)

1. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js
   ```

2. **Start the frontend**
   ```bash
   npm start
   ```

3. **Configure MetaMask**
   - Network: Hardhat (will be added automatically)
   - Chain ID: 31337
   - Import test accounts using private keys from deployment

#### Option 2: Using Local Persistent Network

1. **Start local blockchain** (in terminal 1)
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts** (in terminal 2)
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Start the frontend** (in terminal 3)
   ```bash
   npm start
   ```

4. **Add Local Network to MetaMask**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### MetaMask Setup

Import these test accounts to MetaMask:

**Account #0 (Buyer)**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Account #1 (Seller)**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Account #2 (Inspector)**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

**Account #3 (Lender)**
- Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Private Key: `7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

## How to Use

### For Buyers
1. Connect MetaMask with buyer account
2. Browse available properties
3. Click on a property to view details
4. Click "Buy" to deposit earnest money and approve purchase

### For Inspectors
1. Connect MetaMask with inspector account
2. Click on a property
3. Click "Approve Inspection" after inspection

### For Lenders
1. Connect MetaMask with lender account
2. Click on a property
3. Click "Approve & Lend" to approve and provide financing

### For Sellers
1. Connect MetaMask with seller account
2. Click on a property
3. Click "Approve & Sell" to finalize the sale

## Transaction Flow

1. **Listing**: Seller lists property with price and escrow amount
2. **Deposit**: Buyer deposits earnest money
3. **Inspection**: Inspector approves property condition
4. **Financing**: Lender approves and provides remaining funds
5. **Approval**: All parties approve the transaction
6. **Finalization**: Property ownership transfers to buyer

## Project Structure

```
millow/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/             # Contract tests
├── src/              # React frontend
│   ├── components/   # React components
│   ├── abis/        # Contract ABIs
│   └── assets/      # Images and static files
├── metadata/         # Property metadata
└── artifacts/        # Compiled contracts
```

## Contract Addresses

After deployment, update `src/config.json` with your contract addresses:

```json
{
  "31337": {
    "realEstate": {
      "address": "YOUR_REAL_ESTATE_CONTRACT_ADDRESS"
    },
    "escrow": {
      "address": "YOUR_ESCROW_CONTRACT_ADDRESS"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **MetaMask not connecting**
   - Make sure you're on the correct network (Chain ID: 31337)
   - Try refreshing the page

2. **Transactions failing**
   - Check if you have enough ETH for gas fees
   - Ensure you're using the correct account for your role

3. **Properties not loading**
   - Check if contracts are deployed correctly
   - Verify contract addresses in config.json

4. **Images not loading**
   - IPFS links might be slow, images should load eventually
   - Check browser console for errors

### Getting Help

- Check the browser console for error messages
- Verify MetaMask is connected to the correct network
- Ensure contracts are deployed and addresses are correct in config.json

## License

MIT License - see LICENSE file for details