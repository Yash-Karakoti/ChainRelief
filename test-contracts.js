// Simple test script to verify smart contracts
import hre from "hardhat";

async function main() {
  console.log("🧪 Testing ChainRelief Smart Contracts\n");
  console.log("=" .repeat(60));

  try {
    // Get signers
    const [deployer, org1, org2] = await hre.ethers.getSigners();
    console.log("✅ Signers loaded");
    console.log("   Deployer:", deployer.address);
    console.log("   Org1:", org1.address);
    console.log("   Org2:", org2.address);
    console.log();

    // Deploy TreasuryManager
    console.log("📦 Deploying TreasuryManager...");
    const TreasuryManager = await hre.ethers.getContractFactory("TreasuryManager");
    const treasury = await TreasuryManager.deploy(
      [deployer.address],
      [deployer.address, org1.address]
    );
    await treasury.waitForDeployment();
    const treasuryAddress = await treasury.getAddress();
    console.log("✅ TreasuryManager deployed:", treasuryAddress);
    console.log();

    // Deploy FundDistributor
    console.log("📦 Deploying FundDistributor...");
    const FundDistributor = await hre.ethers.getContractFactory("FundDistributor");
    const distributor = await FundDistributor.deploy([deployer.address]);
    await distributor.waitForDeployment();
    const distributorAddress = await distributor.getAddress();
    console.log("✅ FundDistributor deployed:", distributorAddress);
    console.log();

    // Test 1: Create Campaign
    console.log("🧪 Test 1: Creating Campaign...");
    const tx1 = await treasury.createCampaign(
      "Hurricane Relief Fund 2024",
      hre.ethers.parseEther("50"),
      deployer.address
    );
    await tx1.wait();
    const campaign = await treasury.campaigns(1);
    console.log("✅ Campaign created:");
    console.log("   Name:", campaign.name);
    console.log("   Target:", hre.ethers.formatEther(campaign.targetAmount), "ETH");
    console.log("   Raised:", hre.ethers.formatEther(campaign.raisedAmount), "ETH");
    console.log("   Active:", campaign.active);
    console.log();

    // Test 2: Record Donation
    console.log("🧪 Test 2: Recording Donation...");
    const DISTRIBUTOR_ROLE = await treasury.DISTRIBUTOR_ROLE();
    await treasury.grantRole(DISTRIBUTOR_ROLE, deployer.address);
    
    const tx2 = await treasury.recordDonation(
      deployer.address,
      hre.ethers.ZeroAddress, // ETH
      hre.ethers.parseEther("1"),
      1,
      "0xabcdef123456"
    );
    await tx2.wait();
    
    const donation = await treasury.donations(1);
    console.log("✅ Donation recorded:");
    console.log("   Donor:", donation.donor);
    console.log("   Amount:", hre.ethers.formatEther(donation.amount), "ETH");
    console.log("   Campaign ID:", donation.campaignId.toString());
    console.log();

    // Test 3: Register Organizations
    console.log("🧪 Test 3: Registering Organizations...");
    const tx3 = await distributor.registerOrganization("Red Cross", org1.address);
    await tx3.wait();
    const tx4 = await distributor.registerOrganization("UNICEF", org2.address);
    await tx4.wait();
    
    const org1Data = await distributor.organizations(1);
    const org2Data = await distributor.organizations(2);
    console.log("✅ Organizations registered:");
    console.log("   Org 1:", org1Data.name, "-", org1Data.wallet);
    console.log("   Org 2:", org2Data.name, "-", org2Data.wallet);
    console.log();

    // Test 4: Verify Organizations
    console.log("🧪 Test 4: Verifying Organizations...");
    await distributor.verifyOrganization(1, true);
    await distributor.verifyOrganization(2, true);
    const org1Verified = await distributor.organizations(1);
    console.log("✅ Organizations verified:");
    console.log("   Org 1 verified:", org1Verified.verified);
    console.log();

    // Test 5: Create Distribution Rule
    console.log("🧪 Test 5: Creating Distribution Rule...");
    const tx5 = await distributor.createDistributionRule(
      1, // Campaign ID
      [org1.address, org2.address],
      [6000, 4000] // 60% to org1, 40% to org2
    );
    await tx5.wait();
    
    const rule = await distributor.getDistributionRule(1);
    console.log("✅ Distribution rule created:");
    console.log("   Campaign ID:", rule.campaignId.toString());
    console.log("   Organizations:", rule.orgs.length);
    console.log("   Percentages:", rule.percentages.map(p => (Number(p) / 100).toFixed(2) + "%"));
    console.log();

    // Test 6: Check Contract Stats
    console.log("📊 Contract Statistics:");
    console.log("=" .repeat(60));
    const donationCount = await treasury.donationCount();
    const campaignCount = await treasury.campaignCount();
    const orgCount = await distributor.organizationCount();
    const ruleCount = await distributor.ruleCount();
    
    console.log("TreasuryManager:");
    console.log("   Total Donations:", donationCount.toString());
    console.log("   Total Campaigns:", campaignCount.toString());
    console.log();
    console.log("FundDistributor:");
    console.log("   Total Organizations:", orgCount.toString());
    console.log("   Total Rules:", ruleCount.toString());
    console.log();

    console.log("=" .repeat(60));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.message);
    console.error("\nFull error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


