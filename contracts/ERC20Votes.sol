// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./DAOsigs.sol";

contract Daosig is ERC20 {
    constructor() ERC20("Daosig", "DAOS") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}