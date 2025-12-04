// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAgentAuth.sol";

/// Simple AgentAuth for prototype: owner manages authorized agent addresses.
/// For production, replace/extend with signature verification or multisig-backed verification.
contract AgentAuth is Ownable, IAgentAuth {
    mapping(address => bool) public agents;

    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);

    function addAgent(address a) external onlyOwner {
        agents[a] = true;
        emit AgentAdded(a);
    }

    function removeAgent(address a) external onlyOwner {
        agents[a] = false;
        emit AgentRemoved(a);
    }

    function isAuthorizedAgent(address a) external view override returns (bool) {
        return agents[a];
    }
}

