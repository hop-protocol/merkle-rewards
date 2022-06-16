// import { expect } from "chai";
import { ethers } from "hardhat";
const { parseUnits } = ethers.utils;

describe("MerkleRewards", function () {
  it("Should call setMerkleRoot", async function () {
    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy();
    await merkleRewards.deployed();

    const merkleRoot =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    await merkleRewards.setMerkleRoot(merkleRoot, parseUnits("100"));
  });
});
