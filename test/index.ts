// import { expect } from "chai";
import { ethers } from "hardhat";
const { parseUnits } = ethers.utils;

const MAX_UINT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

describe("MerkleRewards", function () {
  it("Should call setMerkleRoot", async function () {
    const Token = await ethers.getContractFactory("MockToken");
    const token = await Token.deploy();
    await token.deployed();

    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(token.address);
    await merkleRewards.deployed();

    await token.approve(merkleRewards.address, MAX_UINT);

    const merkleRoot =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    await merkleRewards.setMerkleRoot(merkleRoot, parseUnits("100"));
  });
});
