// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", seller.address);
  console.log("Account balance:", (await seller.getBalance()).toString());

  // Deploy RealEstate contract
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();

  console.log(`\nDeployed Real Estate Contract at: ${realEstate.address}`);
  console.log(`Minting 3 Properties...\n`);

  // Mint 3 properties - using local metadata server for development
  const properties = [
    "http://localhost:8080/1.json",
    "http://localhost:8080/2.json", 
    "http://localhost:8080/3.json"
  ];

  for (let i = 0; i < properties.length; i++) {
    const transaction = await realEstate.connect(seller).mint(properties[i]);
    await transaction.wait();
    console.log(`Minted property ${i + 1}: ${properties[i]}`);
  }

  // Deploy Escrow contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    lender.address,
    inspector.address
  );
  await escrow.deployed();

  console.log(`\nDeployed Escrow Contract at: ${escrow.address}`);

  // Approve escrow contract to transfer NFTs
  for (let i = 1; i <= 3; i++) {
    const transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, i);
    await transaction.wait();
    console.log(`Approved escrow contract for property ${i}`);
  }

  // List properties on escrow
  const propertyDetails = [
    { id: 1, buyer: buyer.address, price: tokens(20), escrow: tokens(10) },
    { id: 2, buyer: buyer.address, price: tokens(15), escrow: tokens(5) },
    { id: 3, buyer: buyer.address, price: tokens(10), escrow: tokens(5) },
  ];

  console.log(`\nListing properties on escrow...`);
  for (const property of propertyDetails) {
    const transaction = await escrow
      .connect(seller)
      .list(property.id, property.buyer, property.price, property.escrow);
    await transaction.wait();
    console.log(
      `Listed property ${property.id} - Price: ${ethers.utils.formatEther(
        property.price
      )} ETH, Escrow: ${ethers.utils.formatEther(property.escrow)} ETH`
    );
  }

  console.log(`\n=== Deployment Summary ===`);
  console.log(`RealEstate Contract: ${realEstate.address}`);
  console.log(`Escrow Contract: ${escrow.address}`);
  console.log(`Seller: ${seller.address}`);
  console.log(`Buyer: ${buyer.address}`);
  console.log(`Inspector: ${inspector.address}`);
  console.log(`Lender: ${lender.address}`);
  console.log(`\nTotal Properties Minted: 3`);
  console.log(`All properties listed on escrow and ready for transactions!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
