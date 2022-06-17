//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IMerkleRewards.sol";

contract MerkleRewards is IMerkleRewards, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public immutable override rewardsToken;
    bytes32 public override merkleRoot;
    uint256 public override previousTotalRewards;
    mapping(address => uint256) public override withdrawn;

    constructor(IERC20 _rewardsToken) {
        rewardsToken = _rewardsToken;
    }

    /**
     * @dev Set a new merkleRoot and deposit the additional rewards
     */
    function setMerkleRoot(bytes32 _merkleRoot, uint256 totalRewards) external override onlyOwner {
        require(totalRewards > previousTotalRewards, "MR: totalRewards must be >= previousTotalRewards");

        uint256 additionalRewards = totalRewards.sub(previousTotalRewards, "MR: totalRewards must be >= previousTotalRewards");
        previousTotalRewards = totalRewards;

        merkleRoot = _merkleRoot;
        rewardsToken.safeTransferFrom(msg.sender, address(this), additionalRewards);

        emit MerkleRootSet(_merkleRoot, totalRewards);
    }

    /**
     * @dev Claim all available rewards for `account`.
     * @notice `totalAmount` must be the exact amount set in the latest `merkleRoot`.
     */
    function claim(address account, uint256 totalAmount, bytes32[] calldata proof) external override {
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(account, totalAmount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "MR: Invalid proof");

        uint256 availableAmount = totalAmount.sub(withdrawn[account], "MR: totalAmount already withdrawn");
        withdrawn[account] = totalAmount;

        // Transfer the available amount
        rewardsToken.safeTransfer(account, availableAmount);

        emit Claimed(account, availableAmount, totalAmount);
    }
}
