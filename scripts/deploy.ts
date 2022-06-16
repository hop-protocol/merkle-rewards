import { ethers } from "hardhat";

async function main() {
  const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
  const merkleRewards = await MerkleRewards.deploy();

  await merkleRewards.deployed();

  console.log("MerkleRewards deployed to:", merkleRewards.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
