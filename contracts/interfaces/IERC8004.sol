// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// Minimal ERC8004-like interface for session-based execution.
/// Adapt to the official spec if available.
interface IERC8004 {
    struct Session {
        address initiator;
        address recipient;
        address token;
        uint256 amount;
        uint256 expiry;
        bytes metadata;
    }

    function createSession(Session calldata session) external returns (bytes32 sessionId);
    function claimSession(bytes32 sessionId) external;
    function cancelSession(bytes32 sessionId) external;
    function getSession(bytes32 sessionId) external view returns (Session memory);
}

