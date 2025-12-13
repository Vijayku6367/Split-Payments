const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying contracts...");

  // 1️⃣ SPLIT FACTORY DEPLOY
  const SplitFactory = await hre.ethers.getContractFactory("SplitFactory");
  const factory = await SplitFactory.deploy();
  await factory.deployed(); // ✅ ethers v5

  console.log("✅ SplitFactory deployed to:", factory.address);

  // 2️⃣ TREASURY DEPLOY
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed(); // ✅ ethers v5

  console.log("✅ Treasury deployed to:", treasury.address);

  // 3️⃣ SAVE ADDRESSES
  const addresses = {
    SplitFactory: factory.address,
    Treasury: treasury.address
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(addresses, null, 2)
  );

  console.log("\n📋 DEPLOYED ADDRESSES:");
  console.log(JSON.stringify(addresses, null, 2));

  console.log("\n📁 Saved to:", outputPath);
  console.log("🎉 Deployment Complete!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
