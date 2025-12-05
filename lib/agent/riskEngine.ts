import { createPublicClient, http, formatUnits } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { contracts } from '@/lib/contracts';
import { TOKENS } from '@/lib/tokens';
import { logActivity } from './telemetry';

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
  };
  timestamp: number;
}

interface MarketContext {
  AVAX: { price: number; volatility: number };
  USDC: { price: number };
}

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

export async function evaluateRisk(marketData: MarketContext): Promise<RiskAnalysis> {
  try {
    // 1. Read Risk Parameters from Chain
    // Returns [maxRebalanceBps, volatilityThresholdBps, minRunwayMonths]
    const riskParams = await publicClient.readContract({
      address: contracts.riskParameters.address,
      abi: contracts.riskParameters.abi,
      functionName: 'maxRebalanceBps', // We might need to read individual getters if struct getter isn't available
    }) as bigint; // Actually, wait. The contract has public variables. 

    // The contract has public variables, so they are getters.
    // We need to make multiple calls or use multicall if available. Viem supports multicall.
    // Let's read them individually for simplicity.
    
    const [maxRebalanceBps, volatilityThresholdBps, minRunwayMonths] = await Promise.all([
      publicClient.readContract({ address: contracts.riskParameters.address, abi: contracts.riskParameters.abi, functionName: 'maxRebalanceBps' }),
      publicClient.readContract({ address: contracts.riskParameters.address, abi: contracts.riskParameters.abi, functionName: 'volatilityThresholdBps' }),
      publicClient.readContract({ address: contracts.riskParameters.address, abi: contracts.riskParameters.abi, functionName: 'minRunwayMonths' }),
    ]) as [bigint, bigint, bigint];

    // 2. Read Treasury Balances
    const fujiTokens = TOKENS[avalancheFuji.id];
    const avaxToken = fujiTokens.find(t => t.symbol === 'WAVAX')!;
    const usdcToken = fujiTokens.find(t => t.symbol === 'USDC')!;

    // Read balances from TreasuryVault
    // Note: The vault wrapper balanceOf takes an address
    const [avaxBal, usdcBal] = await Promise.all([
      publicClient.readContract({ 
        address: contracts.treasuryVault.address, 
        abi: contracts.treasuryVault.abi, 
        functionName: 'balanceOf', 
        args: [avaxToken.address as `0x${string}`] 
      }),
      publicClient.readContract({ 
        address: contracts.treasuryVault.address, 
        abi: contracts.treasuryVault.abi, 
        functionName: 'balanceOf', 
        args: [usdcToken.address as `0x${string}`] 
      })
    ]) as [bigint, bigint];

    // 3. Calculate Portfolio Metrics
    const avaxAmt = parseFloat(formatUnits(avaxBal, avaxToken.decimals));
    const usdcAmt = parseFloat(formatUnits(usdcBal, usdcToken.decimals));

    const avaxValue = avaxAmt * marketData.AVAX.price;
    const usdcValue = usdcAmt * marketData.USDC.price;
    const totalValue = avaxValue + usdcValue;

    const avaxExposure = totalValue > 0 ? (avaxValue / totalValue) * 100 : 0;
    const usdcExposure = totalValue > 0 ? (usdcValue / totalValue) * 100 : 0;

    // 4. Determine Risk Level
    const volThresholdPct = Number(volatilityThresholdBps) / 100; // e.g. 1200 bps = 12%
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
    // If AVAX exposure > 60% or < 40%, consider it a risk if volatility is also medium
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

    // Rule 3: Low Balance / Runway (Simulated)
    // If total value is very low (< $100), flag it
    if (totalValue < 100) {
        breachReasons.push(`Treasury value critical (< $100)`);
        if (riskLevel !== 'CRITICAL') riskLevel = 'HIGH';
        action = 'TOP_UP';
    }

    // 5. Compile Analysis
    const analysis: RiskAnalysis = {
      riskLevel,
      breachReasons,
      recommendedAction: action,
      metrics: {
        totalValueUsd: totalValue,
        avaxExposurePct: avaxExposure,
        stablecoinExposurePct: usdcExposure,
        volatilityScore: currentVolPct,
        maxRebalancePct: Number(maxRebalanceBps) / 100,
        volatilityThresholdPct: volThresholdPct
      },
      timestamp: Date.now()
    };

    await logActivity('INFO', `Risk evaluated: ${riskLevel}`, { 
        action, 
        exposure: `${avaxExposure.toFixed(1)}% AVAX` 
    });

    return analysis;

  } catch (error: any) {
    await logActivity('ERROR', 'Risk evaluation failed', { error: error.message });
    throw error;
  }
}
