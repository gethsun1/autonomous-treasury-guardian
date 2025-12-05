import { ethers } from "ethers";

const RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const WAVAX = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
const VAULT = "0x565435bAf0C6A9E06BE4e7F00fE08C95d36F247b";
const amountEth = "3";

const pk = process.env.AGENT_PRIVATE_KEY;
if (!pk || !pk.startsWith("0x") || pk.length !== 66) {
  throw new Error("Missing or invalid AGENT_PRIVATE_KEY (must be 0x-prefixed, 32 bytes)");
}

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(pk, provider);
const amount = ethers.parseEther(amountEth);

console.log(`Using ${wallet.address} on Fuji; wrapping ${amountEth} AVAX`);

const wavaxAbi = [
  "function deposit() payable",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

const vaultAbi = [
  "function deposit(address token, uint256 amount)"
];

async function main() {
  const wavax = new ethers.Contract(WAVAX, wavaxAbi, wallet);
  const vault = new ethers.Contract(VAULT, vaultAbi, wallet);

  const bal = await provider.getBalance(wallet.address);
  if (bal < amount + ethers.parseEther("0.05")) {
    console.warn("Warning: balance may be too low for value + gas");
  }

  let tx = await wavax.deposit({ value: amount });
  console.log("Wrap tx:", tx.hash);
  await tx.wait();
  console.log("Wrap confirmed");

  tx = await wavax.approve(VAULT, amount);
  console.log("Approve tx:", tx.hash);
  await tx.wait();
  console.log("Approve confirmed");

  tx = await vault.deposit(WAVAX, amount);
  console.log("Deposit tx:", tx.hash);
  await tx.wait();
  console.log("Deposit confirmed");

  const vBal = await wavax.balanceOf(VAULT);
  console.log("Vault WAVAX balance now:", ethers.formatEther(vBal));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
