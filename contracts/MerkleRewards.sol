//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MerkleRewards is Ownable {
    function setMerkleRoot(bytes32 merkleRoot, uint256 additionalRewards) external {
        console.log("Set Merkle root");
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external {
        console.log("Claim");
    }
}
