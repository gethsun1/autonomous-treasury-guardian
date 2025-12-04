import hre from "hardhat";

async function main() {
  console.log("HRE keys:", Object.keys(hre));
  console.log("HRE ethers:", hre.ethers ? "Present" : "Undefined");
}

main();
