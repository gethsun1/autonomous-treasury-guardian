import { logActivity } from './telemetry';
import { getOnChainState } from './onchain';

// Standard Risk Levels
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAnalysis {
  riskLevel: RiskLevel;
  breachReasons: string[];
  recommendedAction: 'REBALANCE' | 'TOP_UP' | 'DO_NOTHING';
  metrics: {
    totalValueUsd: number;
    avaxExposurePct: number;
    stablecoinExposurePct: number;
    volatilityScore: number; // from market data
    maxRebalancePct: number; // from contract
    volatilityThresholdPct: number; // from contract
    estimatedRunwayMonths: number;
  };
  timestamp: number;
}

interface MarketContext {
  AVAX: { price: number; volatility: number };
  USDC: { price: number };
  timestamp?: number;
}

// Estimated monthly burn in USD (for runway calculation)
const ESTIMATED_MONTHLY_BURN = 500;

export async function evaluateRisk(marketData: MarketContext): Promise<RiskAnalysis> {
  try {
    // 1. Read On-Chain State (Risk Params + Balances)
    const { riskParams, balances } = await getOnChainState();

    await logActivity('INFO', 'Risk inputs loaded', {
      avaxBalance: balances.avaxAmt,
      usdcBalance: balances.usdcAmt,
      maxRebalanceBps: Number(riskParams.maxRebalanceBps),
      volThresholdBps: Number(riskParams.volatilityThresholdBps),
      minRunwayMonths: Number(riskParams.minRunwayMonths),
      avaxPrice: marketData.AVAX.price,
      usdcPrice: marketData.USDC.price,
      avaxVolatilityBps: marketData.AVAX.volatility,
      timestamp: marketData.timestamp
    });

    // 2. Calculate Portfolio Metrics
    // avaxAmt and usdcAmt are already parsed numbers from getOnChainState
    const avaxValue = balances.avaxAmt * marketData.AVAX.price;
    const usdcValue = balances.usdcAmt * marketData.USDC.price;
    const totalValue = avaxValue + usdcValue;

    const avaxExposure = totalValue > 0 ? (avaxValue / totalValue) * 100 : 0;
    const usdcExposure = totalValue > 0 ? (usdcValue / totalValue) * 100 : 0;

    // 3. Determine Risk Level
    const volThresholdPct = Number(riskParams.volatilityThresholdBps) / 100; // e.g. 1200 bps = 12%
    const currentVolPct = marketData.AVAX.volatility / 100; // assuming input is in bps
    
    let riskLevel: RiskLevel = 'LOW';
    const breachReasons: string[] = [];
    let action: 'REBALANCE' | 'TOP_UP' | 'DO_NOTHING' = 'DO_NOTHING';

    // Rule 1: Volatility Check
    if (currentVolPct > volThresholdPct) {
      riskLevel = 'HIGH';
      breachReasons.push(`Volatility (${currentVolPct.toFixed(2)}%) exceeds threshold (${volThresholdPct.toFixed(2)}%)`);
      action = 'REBALANCE';
    }

    // Rule 2: Exposure Check (Simple 50/50 deviation check for demo)
    // If AVAX exposure > 70% or < 30%, consider it a risk
    if (avaxExposure > 70) {
       riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : 'CRITICAL';
       breachReasons.push(`AVAX exposure (${avaxExposure.toFixed(1)}%) critically high`);
       action = 'REBALANCE';
    } else if (avaxExposure < 30 && totalValue > 10) {
       // If we have funds but low exposure
       riskLevel = 'MEDIUM';
       breachReasons.push(`AVAX exposure (${avaxExposure.toFixed(1)}%) too low`);
       action = 'REBALANCE';
    }

    // Rule 3: Runway Check
    // Calculate runway based on total value and estimated burn
    const runwayMonths = totalValue > 0 ? totalValue / ESTIMATED_MONTHLY_BURN : 0;
    const minRunway = Number(riskParams.minRunwayMonths);

    if (runwayMonths < minRunway) {
        breachReasons.push(`Runway (${runwayMonths.toFixed(1)} months) below minimum (${minRunway} months)`);
        if (riskLevel !== 'CRITICAL') riskLevel = 'HIGH';
        
        // If strictly below, we might need to TOP_UP, but usually rebalancing doesn't fix runway unless we swap to stable?
        // For now, if runway is low, we might suggest TOP_UP.
        action = 'TOP_UP';
    }

    // Legacy check for very low balance
    if (totalValue < 100) {
        breachReasons.push(`Treasury value critical (< $100)`);
        if (riskLevel !== 'CRITICAL') riskLevel = 'HIGH';
        action = 'TOP_UP';
    }

    // 4. Compile Analysis
    const analysis: RiskAnalysis = {
      riskLevel,
      breachReasons,
      recommendedAction: action,
      metrics: {
        totalValueUsd: totalValue,
        avaxExposurePct: avaxExposure,
        stablecoinExposurePct: usdcExposure,
        volatilityScore: currentVolPct,
        maxRebalancePct: Number(riskParams.maxRebalanceBps) / 100,
        volatilityThresholdPct: volThresholdPct,
        estimatedRunwayMonths: runwayMonths
      },
      timestamp: Date.now()
    };

    await logActivity('INFO', `Risk evaluated: ${riskLevel}`, { 
        action, 
        exposure: `${avaxExposure.toFixed(1)}% AVAX`,
        runway: `${runwayMonths.toFixed(1)}m`,
        volatilityScorePct: currentVolPct,
        volatilityThresholdPct: volThresholdPct,
        breachReasons
    });

    return analysis;

  } catch (error: any) {
    await logActivity('ERROR', 'Risk evaluation failed', { error: error.message });
    throw error;
  }
}
