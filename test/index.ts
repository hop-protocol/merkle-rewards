import { expect } from "chai";
import { ethers } from "hardhat";
const { BigNumber } = ethers;
const { parseUnits, keccak256, solidityKeccak256 } = ethers.utils;

const MAX_UINT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const LEAF_SALT = keccak256(
  ethers.utils.toUtf8Bytes("MERKLE_REWARDS_LEAF_HASH")
);

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
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    await merkleRewards.setMerkleRoot(merkleRoot, parseUnits("100"));
  });

  it("Should return the correct leaf salt", async function () {
    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(
      "0x0000000000000000000000000000000000000001"
    );

    await merkleRewards.deployed();

    const leafSalt = await merkleRewards.LEAF_SALT();
    expect(leafSalt).to.eq(LEAF_SALT);
  });

  it("Should distribute claimed funds", async function () {
    const [, claimer1, claimer2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockToken");
    const token = await Token.deploy();
    await token.deployed();

    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(token.address);
    await merkleRewards.deployed();

    await token.approve(merkleRewards.address, MAX_UINT);

    const amount1 = BigNumber.from(5);
    const leaf1 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer1.address, amount1]
    );

    const amount2 = BigNumber.from(3);
    const leaf2 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer2.address, amount2]
    );

    const totalAmount = amount1.add(amount2);

    const merkleRoot = solidityKeccak256(
      ["bytes32", "bytes32"],
      [leaf1, leaf2]
    );
    await merkleRewards.setMerkleRoot(merkleRoot, totalAmount);

    await merkleRewards.claim(claimer1.address, amount1, [leaf2]);
    await merkleRewards.claim(claimer2.address, amount2, [leaf1]);

    const merkleRewardsBalance = await token.balanceOf(merkleRewards.address);
    const claimer1Balance = await token.balanceOf(claimer1.address);
    const claimer2Balance = await token.balanceOf(claimer2.address);

    expect(merkleRewardsBalance.toString()).to.eq("0");
    expect(claimer1Balance.toString()).to.eq("5");
    expect(claimer2Balance.toString()).to.eq("3");
  });

  it("Should revert if funds are claimed", async function () {
    const [, claimer1, claimer2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockToken");
    const token = await Token.deploy();
    await token.deployed();

    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(token.address);
    await merkleRewards.deployed();

    await token.approve(merkleRewards.address, MAX_UINT);

    const amount1 = BigNumber.from(5);
    const leaf1 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer1.address, amount1]
    );

    const amount2 = BigNumber.from(3);
    const leaf2 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer2.address, amount2]
    );

    const totalAmount = amount1.add(amount2);

    const merkleRoot = solidityKeccak256(
      ["bytes32", "bytes32"],
      [leaf1, leaf2]
    );
    await merkleRewards.setMerkleRoot(merkleRoot, totalAmount);

    await merkleRewards.claim(claimer1.address, amount1, [leaf2]);
    expect(
      merkleRewards.claim(claimer1.address, amount1, [leaf2])
    ).to.be.revertedWith("MR: totalAmount already withdrawn");
  });

  it("Should revert if entry is not valid", async function () {
    const [, claimer1, claimer2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockToken");
    const token = await Token.deploy();
    await token.deployed();

    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(token.address);
    await merkleRewards.deployed();

    await token.approve(merkleRewards.address, MAX_UINT);

    const amount1 = BigNumber.from(5);
    const leaf1 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer1.address, amount1]
    );

    const amount2 = BigNumber.from(3);
    const leaf2 = solidityKeccak256(
      ["bytes32", "address", "uint256"],
      [LEAF_SALT, claimer2.address, amount2]
    );

    const totalAmount = amount1.add(amount2);

    const merkleRoot = solidityKeccak256(
      ["bytes32", "bytes32"],
      [leaf1, leaf2]
    );
    await merkleRewards.setMerkleRoot(merkleRoot, totalAmount);

    expect(
      merkleRewards.claim(claimer1.address, amount2, [leaf2])
    ).to.be.revertedWith("MR: Invalid proof");
  });

  it("Should transfer the proper amount when setting the Merkle twice", async function () {
    const Token = await ethers.getContractFactory("MockToken");
    const token = await Token.deploy();
    await token.deployed();

    const MerkleRewards = await ethers.getContractFactory("MerkleRewards");
    const merkleRewards = await MerkleRewards.deploy(token.address);
    await merkleRewards.deployed();

    await token.approve(merkleRewards.address, MAX_UINT);

    const finalTotal = BigNumber.from(10);
    const merkleRoot1 =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const merkleRoot2 =
      "0x0000000000000000000000000000000000000000000000000000000000000002";
    await merkleRewards.setMerkleRoot(merkleRoot1, "5");
    await merkleRewards.setMerkleRoot(merkleRoot2, finalTotal);

    const merkleRewardsBalance = await token.balanceOf(merkleRewards.address);
    expect(merkleRewardsBalance.toString()).to.eq("10");
  });
});
