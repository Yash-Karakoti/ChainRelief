// Verify smart contracts are compiled and ready
import fs from 'fs';
import path from 'path';

console.log("🔍 Verifying ChainRelief Smart Contracts\n");
console.log("=" .repeat(60));

// Check if contracts exist
const contractsDir = './contracts';
const contracts = ['TreasuryManager.sol', 'FundDistributor.sol'];

console.log("\n📁 Checking Contract Files:");
contracts.forEach(contract => {
  const filePath = path.join(contractsDir, contract);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${contract} - ${stats.size} bytes`);
  } else {
    console.log(`❌ ${contract} - NOT FOUND`);
  }
});

// Check if artifacts exist
const artifactsDir = './artifacts/contracts';
console.log("\n🏗️  Checking Compiled Artifacts:");

if (fs.existsSync(artifactsDir)) {
  contracts.forEach(contract => {
    const contractName = contract.replace('.sol', '');
    const artifactPath = path.join(artifactsDir, contract, `${contractName}.json`);
    
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      console.log(`✅ ${contractName}`);
      console.log(`   - ABI entries: ${artifact.abi.length}`);
      console.log(`   - Bytecode length: ${artifact.bytecode.length} chars`);
    } else {
      console.log(`❌ ${contractName} - Artifact not found`);
    }
  });
} else {
  console.log("❌ Artifacts directory not found - contracts not compiled");
}

// Check configuration
console.log("\n⚙️  Checking Configuration:");
if (fs.existsSync('./hardhat.config.cjs')) {
  console.log("✅ hardhat.config.cjs exists");
} else {
  console.log("❌ hardhat.config.cjs not found");
}

// Check deployment scripts
console.log("\n📜 Checking Deployment Scripts:");
const scripts = ['deploy.cjs', 'deploy-simple.js'];
scripts.forEach(script => {
  const scriptPath = path.join('./scripts', script);
  if (fs.existsSync(scriptPath)) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} not found`);
  }
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 SUMMARY:");
console.log("=".repeat(60));

const allContractsExist = contracts.every(c => 
  fs.existsSync(path.join(contractsDir, c))
);

const allArtifactsExist = fs.existsSync(artifactsDir) && contracts.every(c => {
  const contractName = c.replace('.sol', '');
  return fs.existsSync(path.join(artifactsDir, c, `${contractName}.json`));
});

if (allContractsExist && allArtifactsExist) {
  console.log("✅ All contracts compiled and ready!");
  console.log("✅ Ready for deployment!");
  console.log("\n📝 Next Steps:");
  console.log("   1. Deploy to local network: npm run deploy:local");
  console.log("   2. Deploy to Sepolia: npm run deploy:sepolia");
  console.log("   3. Verify on Etherscan after deployment");
} else {
  console.log("⚠️  Some contracts or artifacts missing");
  console.log("   Run: npx hardhat compile --config hardhat.config.cjs");
}

console.log("=".repeat(60));


