const { ethers } = require("hardhat");

async function debugContracts() {
  console.log("🔍 Debugging Contract Deployment...\n");

  try {
    // Get the deployed contract addresses from config
    const config = require("./src/config.json");
    console.log("Config:", JSON.stringify(config, null, 2));

    // Connect to localhost (make sure hardhat node is running)
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    
    try {
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.chainId);
    } catch (error) {
      console.log("❌ Cannot connect to localhost:8545");
      console.log("Make sure you run: npx hardhat node");
      return;
    }
    
    const realEstateAddress = config["31337"].realEstate.address;
    const escrowAddress = config["31337"].escrow.address;

    console.log("Checking contracts...");
    console.log("RealEstate address:", realEstateAddress);
    console.log("Escrow address:", escrowAddress);

    // Check if code exists at these addresses
    const realEstateCode = await provider.getCode(realEstateAddress);
    const escrowCode = await provider.getCode(escrowAddress);

    console.log("RealEstate has code:", realEstateCode !== "0x");
    console.log("Escrow has code:", escrowCode !== "0x");

    if (realEstateCode === "0x" || escrowCode === "0x") {
      console.log("\n❌ Contracts not deployed! Run: npx hardhat run scripts/deploy.js");
      return;
    }

    // Try to interact with contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    const realEstate = RealEstate.attach(realEstateAddress);
    const escrow = Escrow.attach(escrowAddress);

    console.log("\n📋 Contract Information:");
    
    // Check RealEstate
    const totalSupply = await realEstate.totalSupply();
    console.log("Total properties minted:", totalSupply.toString());

    // Check Escrow
    const seller = await escrow.seller();
    const inspector = await escrow.inspector();
    const lender = await escrow.lender();

    console.log("Seller:", seller);
    console.log("Inspector:", inspector);
    console.log("Lender:", lender);

    // Check property 1
    if (totalSupply.gt(0)) {
      console.log("\n🏠 Property 1 Details:");
      const isListed = await escrow.isListed(1);
      const purchasePrice = await escrow.purchasePrice(1);
      const escrowAmount = await escrow.escrowAmount(1);
      const buyer = await escrow.buyer(1);

      console.log("Listed:", isListed);
      console.log("Purchase Price:", ethers.utils.formatEther(purchasePrice), "ETH");
      console.log("Escrow Amount:", ethers.utils.formatEther(escrowAmount), "ETH");
      console.log("Buyer:", buyer);
    }

    console.log("\n✅ Contracts are properly deployed and accessible!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\nTry running:");
    console.log("1. npx hardhat node (in separate terminal)");
    console.log("2. npx hardhat run scripts/deploy.js --network localhost");
  }
}

debugContracts();