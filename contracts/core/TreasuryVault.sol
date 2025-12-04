// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../core/PermissionManager.sol";
import "../core/RiskParameters.sol";
import "../interfaces/IAgentAuth.sol";

contract TreasuryVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    PermissionManager public perm;
    RiskParameters public risk;
    IAgentAuth public agentAuth;

    event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(address _perm, address _agentAuth, address _risk) {
        require(_perm != address(0) && _agentAuth != address(0) && _risk != address(0), "invalid addresses");
        perm = PermissionManager(_perm);
        agentAuth = IAgentAuth(_agentAuth);
        risk = RiskParameters(_risk);
    }

    /// Anyone can deposit tokens to the vault
    function deposit(IERC20 token, uint256 amount) external nonReentrant {
        require(amount > 0, "amount zero");
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(address(token), msg.sender, amount);
    }

    /// Withdraw can be initiated by an executor role or the owner (multisig recommended)
    function withdraw(IERC20 token, address to, uint256 amount) external nonReentrant {
        require(amount > 0, "amount zero");
        require(to != address(0), "invalid recipient");
        // Only ActionExecutor (EXECUTOR role) or owner can withdraw
        require(perm.hasRole(msg.sender, PermissionManager.Role.EXECUTOR) || msg.sender == owner(), "not authorized");

        // Safety check: enforce max withdrawal cap based on RiskParameters
        uint256 vaultBal = token.balanceOf(address(this));
        uint256 maxAllowed = (vaultBal * risk.maxRebalanceBps()) / 10000;
        require(amount <= maxAllowed, "exceeds vault withdrawal cap");

        token.safeTransfer(to, amount);
        emit Withdrawn(address(token), to, amount);
    }

    function balanceOf(IERC20 token) external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}

