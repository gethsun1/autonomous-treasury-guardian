// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PermissionManager is Ownable {
    enum Role { NONE, AGENT, GOVERNANCE, EXECUTOR }

    mapping(address => Role) private _roles;
    bool public paused;

    event RoleAssigned(address indexed who, Role role);
    event RoleRevoked(address indexed who);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    modifier notPaused() {
        require(!paused, "PermissionManager: paused");
        _;
    }

    function assignRole(address who, Role role) external onlyOwner {
        _roles[who] = role;
        emit RoleAssigned(who, role);
    }

    function revokeRole(address who) external onlyOwner {
        _roles[who] = Role.NONE;
        emit RoleRevoked(who);
    }

    function setPaused(bool p) external onlyOwner {
        paused = p;
        if (p) emit Paused(msg.sender);
        else emit Unpaused(msg.sender);
    }

    function hasRole(address who, Role role) external view returns (bool) {
        return _roles[who] == role;
    }

    function isPrivileged(address who) external view returns (bool) {
        Role r = _roles[who];
        return r == Role.AGENT || r == Role.GOVERNANCE || r == Role.EXECUTOR;
    }

    function getRole(address who) external view returns (Role) {
        return _roles[who];
    }
}

