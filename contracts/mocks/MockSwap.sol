// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// Minimal swap proxy for prototype: accepts tokenFrom and sends back tokenTo at 1:1 (mock).
/// Only for local/testing. DO NOT USE IN PRODUCTION.
contract MockSwap {
    using SafeERC20 for IERC20;

    event Swapped(address indexed caller, address tokenFrom, address tokenTo, uint256 amountIn, uint256 amountOut);

    /// This function assumes the caller has already transferred tokenFrom to this contract (or approved and called).
    /// For prototype ease, it will transfer tokenTo from this contract to the vault or recipient.
    function swapExactIn(address tokenFrom, address tokenTo, uint256 amountIn, address recipient) external {
        // In prototype, assume this contract already holds amountOut of tokenTo for the swap.
        uint256 amountOut = amountIn; // 1:1 mock
        IERC20(tokenTo).safeTransfer(recipient, amountOut);
        emit Swapped(msg.sender, tokenFrom, tokenTo, amountIn, amountOut);
    }
}

