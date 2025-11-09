async function main() {
  const { ethers } = await import("hardhat");
  console.log("🚀 Deploying ChainRelief Smart Contracts...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy TreasuryManager
  console.log("📦 Deploying TreasuryManager...");
  
  const admins = [deployer.address];
  const approvers = [deployer.address, deployer.address]; // In production, use different addresses
  
  const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
  const treasury = await TreasuryManager.deploy(admins, approvers);
  await treasury.waitForDeployment();
  
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ TreasuryManager deployed to:", treasuryAddress);
  console.log();

  // Deploy FundDistributor
  console.log("📦 Deploying FundDistributor...");
  
  const FundDistributor = await ethers.getContractFactory("FundDistributor");
  const distributor = await FundDistributor.deploy(admins);
  await distributor.waitForDeployment();
  
  const distributorAddress = await distributor.getAddress();
  console.log("✅ FundDistributor deployed to:", distributorAddress);
  console.log();

  // Setup initial configuration
  console.log("⚙️  Setting up initial configuration...");
  
  // Grant distributor role to FundDistributor contract in TreasuryManager
  const DISTRIBUTOR_ROLE = await treasury.DISTRIBUTOR_ROLE();
  await treasury.grantRole(DISTRIBUTOR_ROLE, distributorAddress);
  console.log("✅ Granted DISTRIBUTOR_ROLE to FundDistributor");
  
  // Create a sample campaign
  const tx = await treasury.createCampaign(
    "Hurricane Relief Fund 2024",
    ethers.parseEther("50"), // 50 ETH target
    deployer.address
  );
  await tx.wait();
  console.log("✅ Created sample campaign");
  console.log();

  // Print deployment summary
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(50));
  console.log("TreasuryManager:", treasuryAddress);
  console.log("FundDistributor:", distributorAddress);
  console.log("Deployer:", deployer.address);
  console.log("=" .repeat(50));
  console.log();

  // Save deployment addresses
  const fs = await import("fs");
  const deploymentInfo = {
    network: "hardhat",
    treasuryManager: treasuryAddress,
    fundDistributor: distributorAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.default.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-info.json");
  console.log();

  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

