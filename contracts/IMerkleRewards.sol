//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMerkleRewards {
    event Claimed(address account, uint256 amount, uint256 totalAmount);
    event MerkleRootSet(bytes32 merkleRoot, uint256 totalRewards);

    function rewardsToken() external view returns (IERC20);
    function merkleRoot() external view returns (bytes32);
    function previousTotalRewards() external view returns (uint256);
    function withdrawn(address account) external view returns (uint256);
    function setMerkleRoot(bytes32 _merkleRoot, uint256 totalRewards) external;
    function claim(address account, uint256 totalAmount, bytes32[] calldata proof) external;
}
