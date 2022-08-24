//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IMerkleRewards.sol";

contract MerkleRewards is IMerkleRewards, Ownable {
    using SafeERC20 for IERC20;

    // keccak256(abi.encodePacked("MERKLE_REWARDS_LEAF_HASH")) == 0xc25f889d60f4bc528f554912ac35e9e397b99db0e4dedf3f36bfbe75247f4c5a
    bytes32 public immutable LEAF_SALT = keccak256(abi.encodePacked("MERKLE_REWARDS_LEAF_HASH"));
    IERC20 public immutable override rewardsToken;
    bytes32 public override merkleRoot;
    uint256 public override currentTotalRewards;
    mapping(address => uint256) public override withdrawn;

    constructor(IERC20 _rewardsToken) {
        require(address(_rewardsToken) != address(0), "MR: _rewardsToken must be non-zero");
        rewardsToken = _rewardsToken;
    }

    /**
     * @dev Set a new merkleRoot and deposit the additional rewards
     */
    function setMerkleRoot(bytes32 _merkleRoot, uint256 totalRewards) external override onlyOwner {
        require(_merkleRoot != bytes32(0), "MR: _merkleRoot must be non-zero");
        require(merkleRoot != _merkleRoot, "MR: Must use new Merkle root");
        require(totalRewards > currentTotalRewards, "MR: totalRewards must be > currentTotalRewards");

        uint256 additionalRewards;
        unchecked {
            additionalRewards = totalRewards - currentTotalRewards;
        }
        currentTotalRewards = totalRewards;

        merkleRoot = _merkleRoot;
        emit MerkleRootSet(_merkleRoot, totalRewards);

        rewardsToken.safeTransferFrom(msg.sender, address(this), additionalRewards);
    }

    /**
     * @dev Claim all available rewards for `account`.
     * @notice `totalAmount` must be the exact amount set in the latest `merkleRoot`.
     */
    function claim(address account, uint256 totalAmount, bytes32[] calldata proof) external override {
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(LEAF_SALT, account, totalAmount));
        require(MerkleProof.verifyCalldata(proof, merkleRoot, leaf), "MR: Invalid proof");

        _distribute(account, totalAmount);
    }

    /**
     * @dev Claim all available rewards for `accounts`.
     * @notice `totalAmounts` must be the exact amount set in the latest `merkleRoot`.
     */
    function claimMultiple(
        address[] calldata accounts,
        uint256[] calldata totalAmounts,
        bytes32[] calldata proof,
        bool[] calldata proofFlags
    )
        external
        override
    {
        uint256 numAccounts = accounts.length;
        require(numAccounts == totalAmounts.length, "MR: accounts and totalAmounts must be same length");

        // Verify Merkle proof
        bytes32 leafSalt = LEAF_SALT;
        bytes32[] memory leaves = new bytes32[](accounts.length);
        for (uint256 i = 0; i < numAccounts; i++) {
            leaves[i] = keccak256(abi.encodePacked(leafSalt, accounts[i], totalAmounts[i]));
        }
        require(MerkleProof.multiProofVerifyCalldata(proof, proofFlags, merkleRoot, leaves), "MR: Invalid proof");

        for (uint256 i = 0; i < numAccounts; i++) {
            _distribute(accounts[i], totalAmounts[i]);
        }
    }

    function _distribute(address account, uint256 totalAmount) private {
        uint256 withdrawnAmount = withdrawn[account];
        require(totalAmount > withdrawnAmount, "MR: totalAmount already withdrawn");

        withdrawn[account] = totalAmount;
        // Transfer the available amount
        uint256 availableAmount;
        unchecked {
            availableAmount = totalAmount - withdrawnAmount;
        }
        emit Claimed(account, availableAmount, totalAmount);

        rewardsToken.safeTransfer(account, availableAmount);
    }
}
