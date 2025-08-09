// Simple test script to verify the workflow
const { ethers } = require("hardhat");

async function testWorkflow() {
  console.log("🧪 Testing Millow Workflow...\n");

  // Get accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();
  
  console.log("👥 Accounts:");
  console.log("Buyer:", buyer.address);
  console.log("Seller:", seller.address);
  console.log("Inspector:", inspector.address);
  console.log("Lender:", lender.address);
  console.log();

  // Get deployed contracts (assuming they're deployed)
  const realEstateAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const escrowAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const RealEstate = await ethers.getContractFactory("RealEstate");
  const Escrow = await ethers.getContractFactory("Escrow");

  const realEstate = RealEstate.attach(realEstateAddress);
  const escrow = Escrow.attach(escrowAddress);

  console.log("📋 Contract Status:");
  console.log("RealEstate:", realEstate.address);
  console.log("Escrow:", escrow.address);
  console.log();

  // Test property 1
  const propertyId = 1;
  
  try {
    console.log("🏠 Testing Property", propertyId);
    
    // Check initial state
    const isListed = await escrow.isListed(propertyId);
    const purchasePrice = await escrow.purchasePrice(propertyId);
    const escrowAmount = await escrow.escrowAmount(propertyId);
    
    console.log("Listed:", isListed);
    console.log("Purchase Price:", ethers.utils.formatEther(purchasePrice), "ETH");
    console.log("Escrow Amount:", ethers.utils.formatEther(escrowAmount), "ETH");
    console.log();

    // Test buyer deposit
    console.log("💰 Testing Buyer Deposit...");
    let tx = await escrow.connect(buyer).depositEarnest(propertyId, { value: escrowAmount });
    await tx.wait();
    console.log("✅ Earnest money deposited");

    // Test buyer approval
    tx = await escrow.connect(buyer).approveSale(propertyId);
    await tx.wait();
    console.log("✅ Buyer approved sale");

    // Test inspection
    console.log("🔍 Testing Inspection...");
    tx = await escrow.connect(inspector).updateInspectionStatus(propertyId, true);
    await tx.wait();
    console.log("✅ Inspection approved");

    // Test lender approval
    console.log("🏦 Testing Lender Approval...");
    tx = await escrow.connect(lender).approveSale(propertyId);
    await tx.wait();
    console.log("✅ Lender approved");

    // Send remaining funds
    const remainingAmount = purchasePrice.sub(escrowAmount);
    tx = await lender.sendTransaction({ 
      to: escrow.address, 
      value: remainingAmount 
    });
    await tx.wait();
    console.log("✅ Lender sent remaining funds");

    // Test seller finalization
    console.log("🏡 Testing Sale Finalization...");
    tx = await escrow.connect(seller).approveSale(propertyId);
    await tx.wait();
    console.log("✅ Seller approved");

    tx = await escrow.connect(seller).finalizeSale(propertyId);
    await tx.wait();
    console.log("✅ Sale finalized");

    // Check final ownership
    const newOwner = await realEstate.ownerOf(propertyId);
    console.log("🎉 New Owner:", newOwner);
    console.log("✅ Workflow completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testWorkflow().catch(console.error);