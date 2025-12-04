// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/// RiskParameters holds configurable thresholds for treasury management.
/// Values use basis points or simple units as documented in the contract.
contract RiskParameters is Ownable {
    // Basis points (1e4 == 100.00)
    uint256 public maxRebalanceBps; // e.g., 5000 == 50.00%
    uint256 public volatilityThresholdBps; // e.g., 1200 == 12.00%
    uint256 public minRunwayMonths; // integer months

    event ParametersUpdated(uint256 maxRebalanceBps, uint256 volatilityThresholdBps, uint256 minRunwayMonths);

    constructor(uint256 _maxRebalanceBps, uint256 _volatilityThresholdBps, uint256 _minRunwayMonths) {
        maxRebalanceBps = _maxRebalanceBps;
        volatilityThresholdBps = _volatilityThresholdBps;
        minRunwayMonths = _minRunwayMonths;
    }

    function updateParameters(uint256 _maxRebalanceBps, uint256 _volatilityThresholdBps, uint256 _minRunwayMonths) external onlyOwner {
        maxRebalanceBps = _maxRebalanceBps;
        volatilityThresholdBps = _volatilityThresholdBps;
        minRunwayMonths = _minRunwayMonths;
        emit ParametersUpdated(_maxRebalanceBps, _volatilityThresholdBps, _minRunwayMonths);
    }
}

