// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// Agent authorization verifier. Implemented by a verifier contract or multisig adapter.
interface IAgentAuth {
    function isAuthorizedAgent(address agent) external view returns (bool);
}

