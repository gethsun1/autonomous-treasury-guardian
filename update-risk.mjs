import { ethers } from "ethers";

const RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const RISK = process.env.NEXT_PUBLIC_RISK_PARAMETERS_ADDRESS || "0xEC85cC46c6C514a6e05361f682c884d30d0cc9D3";
const pk = process.env.AGENT_PRIVATE_KEY;
if (!pk || !pk.startsWith('0x') || pk.length !== 66) throw new Error('Invalid AGENT_PRIVATE_KEY');

// Desired parameters
const maxRebalancePct = Number(process.env.MAX_REBALANCE_PCT || 50); // percent
const volThresholdPct = Number(process.env.VOL_THRESHOLD_PCT || 5);  // percent
const minRunwayMonths = BigInt(process.env.MIN_RUNWAY_MONTHS || 6);

const toBps = (pct) => BigInt(Math.round(pct * 100));

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(pk, provider);
const abi = ["function updateParameters(uint256,uint256,uint256)", "function owner() view returns (address)", "function maxRebalanceBps() view returns (uint256)", "function volatilityThresholdBps() view returns (uint256)", "function minRunwayMonths() view returns (uint256)"];

(async () => {
  const contract = new ethers.Contract(RISK, abi, wallet);
  const owner = await contract.owner();
  console.log('Owner:', owner, 'Sender:', wallet.address);
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log('Sender is not owner; aborting update.');
    return;
  }

  const before = {
    maxRebalanceBps: (await contract.maxRebalanceBps()).toString(),
    volatilityThresholdBps: (await contract.volatilityThresholdBps()).toString(),
    minRunwayMonths: (await contract.minRunwayMonths()).toString()
  };
  console.log('Before:', before);

  const tx = await contract.updateParameters(toBps(maxRebalancePct), toBps(volThresholdPct), minRunwayMonths);
  console.log('Tx sent:', tx.hash);
  await tx.wait();
  console.log('Tx confirmed');

  const after = {
    maxRebalanceBps: (await contract.maxRebalanceBps()).toString(),
    volatilityThresholdBps: (await contract.volatilityThresholdBps()).toString(),
    minRunwayMonths: (await contract.minRunwayMonths()).toString()
  };
  console.log('After:', after);
})();
