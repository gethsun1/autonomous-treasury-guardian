// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../core/PermissionManager.sol";
import "../core/RiskParameters.sol";
import "../interfaces/IERC8004.sol";
import "../interfaces/IAgentAuth.sol";
import "../core/TreasuryVault.sol";

/// ActionExecutor is the secure gateway that performs authorized treasury actions.
/// For prototype: swap logic is delegated to a swapProxy (MockSwap or DEX router).
contract ActionExecutor is ReentrancyGuard {
    using SafeERC20 for IERC20;

    PermissionManager public perm;
    RiskParameters public risk;
    TreasuryVault public vault;
    IAgentAuth public agentAuth;
    IERC8004 public erc8004;
    address public swapProxy; // address of a swap helper/DEX router

    event ActionProposed(bytes32 indexed id, address indexed agent, string actionType, address tokenFrom, address tokenTo, uint256 amount, string reason, uint256 timestamp);
    event ActionExecuted(bytes32 indexed id, address indexed agent, string actionType, address tokenFrom, address tokenTo, uint256 amount, uint256 timestamp);
    event PaymentExecuted(address indexed token, address indexed recipient, uint256 amount, address initiatedBy, uint256 timestamp);

    constructor(address _perm, address _risk, address _vault, address _agentAuth, address _erc8004, address _swapProxy) {
        require(_perm != address(0) && _risk != address(0) && _vault != address(0) && _agentAuth != address(0), "invalid");
        perm = PermissionManager(_perm);
        risk = RiskParameters(_risk);
        vault = TreasuryVault(_vault);
        agentAuth = IAgentAuth(_agentAuth);
        erc8004 = IERC8004(_erc8004);
        swapProxy = _swapProxy;
    }

    modifier onlyAuthorizedAgent() {
        require(agentAuth.isAuthorizedAgent(msg.sender) || perm.hasRole(msg.sender, PermissionManager.Role.EXECUTOR) || perm.hasRole(msg.sender, PermissionManager.Role.GOVERNANCE), "not authorized agent");
        _;
    }

    /// Propose an action on-chain (lightweight event emission)
    function proposeAction(bytes32 id, string calldata actionType, address tokenFrom, address tokenTo, uint256 amount, string calldata reason) external {
        require(agentAuth.isAuthorizedAgent(msg.sender) || perm.hasRole(msg.sender, PermissionManager.Role.EXECUTOR), "not agent");
        emit ActionProposed(id, msg.sender, actionType, tokenFrom, tokenTo, amount, reason, block.timestamp);
    }

    /// Execute a rebalance: withdraw from vault, perform swap via swapProxy, and return funds to vault or target
    function executeRebalance(address tokenFrom, address tokenTo, uint256 amountFrom, bytes calldata swapData, bytes32 actionId) external nonReentrant {
        require(!perm.paused(), "system paused");
        // Authorization: only agent or executor or owner flow (owner via multisig should be executor)
        require(agentAuth.isAuthorizedAgent(msg.sender) || perm.hasRole(msg.sender, PermissionManager.Role.EXECUTOR) || perm.hasRole(msg.sender, PermissionManager.Role.GOVERNANCE), "not authorized");

        // enforce caps from risk params
        uint256 vaultBalance = IERC20(tokenFrom).balanceOf(address(vault));
        require(vaultBalance > 0, "insufficient vault balance");
        uint256 maxAllowed = (vaultBalance * risk.maxRebalanceBps()) / 10000;
        require(amountFrom <= maxAllowed, "exceeds rebalance cap");

        // 1) withdraw to this contract
        vault.withdraw(IERC20(tokenFrom), address(this), amountFrom);

        uint256 beforeBal = IERC20(tokenTo).balanceOf(address(this));

        // 2) perform swap via swapProxy (for prototype swapProxy can be a MockSwap)
        if (swapProxy != address(0)) {
            // approve swapProxy
            IERC20(tokenFrom).safeApprove(swapProxy, 0);
            IERC20(tokenFrom).safeApprove(swapProxy, amountFrom);
            (bool ok, ) = swapProxy.call(swapData);
            require(ok, "swap failed");
            // after swap, the swapProxy should have sent tokenTo back to this contract or to the vault
        }

        uint256 received = IERC20(tokenTo).balanceOf(address(this)) - beforeBal;

        // Emit execution - for prototype we don't compute received amount
        emit ActionExecuted(actionId, msg.sender, "REBALANCE", tokenFrom, tokenTo, received, block.timestamp);
    }

    /// Execute a payment from the vault to recipient
    function executePayment(address token, address recipient, uint256 amount, bytes32 actionId) external nonReentrant {
        require(!perm.paused(), "system paused");
        require(agentAuth.isAuthorizedAgent(msg.sender) || perm.hasRole(msg.sender, PermissionManager.Role.EXECUTOR) || perm.hasRole(msg.sender, PermissionManager.Role.GOVERNANCE), "not authorized");
        // Enforce simple cap: use maxRebalanceBps as single tx cap proxy
        uint256 vaultBalance = IERC20(token).balanceOf(address(vault));
        uint256 maxAllowed = (vaultBalance * risk.maxRebalanceBps()) / 10000;
        require(amount <= maxAllowed, "exceeds payment cap");

        vault.withdraw(IERC20(token), recipient, amount);
        emit PaymentExecuted(token, recipient, amount, msg.sender, block.timestamp);
    }

    /// Optional: claim an ERC8004 session and execute associated action. Implementation depends on ERC8004 spec.
    function claimSessionAndExecute(bytes32 sessionId, bytes calldata execPayload) external nonReentrant {
        // Example placeholder: verify session then execute based on payload
        // This method must be implemented according to your ERC8004 contract design.
        erc8004.claimSession(sessionId);
        // After claim, parse execPayload and run the associated action (e.g., executePayment or executeRebalance)
    }

    /// Admin function to update swapProxy
    function setSwapProxy(address _swapProxy) external {
        require(perm.hasRole(msg.sender, PermissionManager.Role.GOVERNANCE), "not governance");
        swapProxy = _swapProxy;
    }
}

