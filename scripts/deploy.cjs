const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy PermissionManager
  const PermissionManager = await hre.ethers.getContractFactory("PermissionManager");
  const perm = await PermissionManager.deploy();
  await perm.waitForDeployment();
  console.log("PermissionManager deployed to:", await perm.getAddress());

  // 2. Deploy AgentAuth
  const AgentAuth = await hre.ethers.getContractFactory("AgentAuth");
  const agentAuth = await AgentAuth.deploy();
  await agentAuth.waitForDeployment();
  console.log("AgentAuth deployed to:", await agentAuth.getAddress());

  // 3. Deploy RiskParameters
  // maxRebalanceBps: 5000 (50%), volatilityThreshold: 1200 (12%), minRunwayMonths: 6
  const RiskParameters = await hre.ethers.getContractFactory("RiskParameters");
  const risk = await RiskParameters.deploy(5000, 1200, 6);
  await risk.waitForDeployment();
  console.log("RiskParameters deployed to:", await risk.getAddress());

  // 4. Deploy TreasuryVault
  const TreasuryVault = await hre.ethers.getContractFactory("TreasuryVault");
  const vault = await TreasuryVault.deploy(await perm.getAddress(), await agentAuth.getAddress(), await risk.getAddress());
  await vault.waitForDeployment();
  console.log("TreasuryVault deployed to:", await vault.getAddress());

  // 5. Deploy MockSwap (as Swap Proxy)
  const MockSwap = await hre.ethers.getContractFactory("MockSwap");
  const mockSwap = await MockSwap.deploy();
  await mockSwap.waitForDeployment();
  console.log("MockSwap deployed to:", await mockSwap.getAddress());

  // 6. Deploy MockERC8004 (or use a placeholder)
  const MockERC8004 = await hre.ethers.getContractFactory("MockERC8004");
  const erc8004 = await MockERC8004.deploy();
  await erc8004.waitForDeployment();
  console.log("MockERC8004 deployed to:", await erc8004.getAddress());

  // 7. Deploy ActionExecutor
  const ActionExecutor = await hre.ethers.getContractFactory("ActionExecutor");
  const executor = await ActionExecutor.deploy(
    await perm.getAddress(),
    await risk.getAddress(),
    await vault.getAddress(),
    await agentAuth.getAddress(),
    await erc8004.getAddress(),
    await mockSwap.getAddress()
  );
  await executor.waitForDeployment();
  console.log("ActionExecutor deployed to:", await executor.getAddress());

  // 8. Assign Roles
  // Role { NONE, AGENT, GOVERNANCE, EXECUTOR } -> 0, 1, 2, 3
  const ROLE_AGENT = 1;
  const ROLE_GOVERNANCE = 2;
  const ROLE_EXECUTOR = 3;

  console.log("Assigning roles...");
  
  // Assign EXECUTOR role to ActionExecutor contract
  let tx = await perm.assignRole(await executor.getAddress(), ROLE_EXECUTOR);
  await tx.wait();
  console.log("Assigned EXECUTOR role to ActionExecutor");

  // Assign AGENT role to AgentAuth contract
  tx = await perm.assignRole(await agentAuth.getAddress(), ROLE_AGENT);
  await tx.wait();
  console.log("Assigned AGENT role to AgentAuth");

  // Assign GOVERNANCE role to deployer
  tx = await perm.assignRole(deployer.address, ROLE_GOVERNANCE);
  await tx.wait();
  console.log("Assigned GOVERNANCE role to deployer");

  console.log("Deployment complete.");
  
  // Save addresses for frontend
  const addresses = {
    PermissionManager: await perm.getAddress(),
    AgentAuth: await agentAuth.getAddress(),
    RiskParameters: await risk.getAddress(),
    TreasuryVault: await vault.getAddress(),
    MockSwap: await mockSwap.getAddress(),
    MockERC8004: await erc8004.getAddress(),
    ActionExecutor: await executor.getAddress()
  };
  
  fs.writeFileSync("deployed_addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to deployed_addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
