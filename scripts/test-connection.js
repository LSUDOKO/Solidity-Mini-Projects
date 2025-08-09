const { ethers } = require("hardhat");

async function main() {
  console.log("Testing connection to localhost...");
  
  try {
    const [signer] = await ethers.getSigners();
    console.log("Connected! First account:", signer.address);
    
    const balance = await signer.getBalance();
    console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network);
    
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

main().catch(console.error);