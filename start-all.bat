@echo off
echo Starting Millow Development Environment...
echo.

echo Step 1: Start Hardhat Node (keep this terminal open)
echo Run this command in a separate terminal:
echo npx hardhat node
echo.

echo Step 2: Start Metadata Server (keep this terminal open)  
echo Run this command in another terminal:
echo node serve-metadata.js
echo.

echo Step 3: Deploy Contracts
echo Run this command in another terminal:
echo npx hardhat run scripts/deploy.js --network localhost
echo.

echo Step 4: Start Frontend
echo Run this command in another terminal:
echo npm start
echo.

echo Step 5: Configure MetaMask
echo - Network Name: Hardhat Local
echo - RPC URL: http://127.0.0.1:8545
echo - Chain ID: 31337
echo - Currency Symbol: ETH
echo.

echo Import these accounts to MetaMask:
echo Buyer: ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo Seller: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
echo Inspector: 5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
echo Lender: 7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

pause