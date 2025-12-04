// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IERC8004.sol";

contract MockERC8004 is IERC8004 {
    mapping(bytes32 => Session) public sessions;
    
    function createSession(Session calldata session) external override returns (bytes32 sessionId) {
        sessionId = keccak256(abi.encode(session, block.timestamp, msg.sender));
        sessions[sessionId] = session;
    }

    function claimSession(bytes32 sessionId) external override {
        // mock claim
    }

    function cancelSession(bytes32 sessionId) external override {
        delete sessions[sessionId];
    }

    function getSession(bytes32 sessionId) external view override returns (Session memory) {
        return sessions[sessionId];
    }
}
