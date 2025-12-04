import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { contracts } from './contracts';

// Initialize Viem client
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http()
});

export interface MarketData {
  price: number;
  volatilityBps: number; // Basis points (e.g. 500 = 5%)
}

export interface RiskAnalysis {
  actionNeeded: 'NONE' | 'REBALANCE' | 'PAYMENT_HALT' | 'ALERT';
  reason?: string;
  currentMetrics: {
    volatilityBps: number;
    maxRebalanceBps: number;
    volatilityThresholdBps: number;
    minRunwayMonths: number;
  };
}

// Mock Market Data Fetcher (Replace with CoinGecko/Pyth)
export async function fetchMarketData(tokenSymbol: string): Promise<MarketData> {
  // Simulation: Randomize volatility between 0% and 15% (0-1500 bps)
  // Occasional spike > 12% (1200 bps) to trigger alerts
  const randomVol = Math.floor(Math.random() * 1500); 
  const basePrice = 1.0; // Stablecoin peg
  
  return {
    price: basePrice,
    volatilityBps: randomVol
  };
}

export async function evaluateRisk(): Promise<RiskAnalysis> {
  try {
    // 1. Fetch On-Chain Risk Parameters
    // We can read public variables directly
    const maxRebalanceBps = await publicClient.readContract({
      address: contracts.riskParameters.address,
      abi: contracts.riskParameters.abi,
      functionName: 'maxRebalanceBps',
    }) as bigint;
    
    const volatilityThresholdBps = await publicClient.readContract({
      address: contracts.riskParameters.address,
      abi: contracts.riskParameters.abi,
      functionName: 'volatilityThresholdBps',
    }) as bigint;

    const minRunwayMonths = await publicClient.readContract({
      address: contracts.riskParameters.address,
      abi: contracts.riskParameters.abi,
      functionName: 'minRunwayMonths',
    }) as bigint;

    // 2. Fetch Market Data
    const marketData = await fetchMarketData("USDC");
    
    // 3. Evaluate
    const volThreshold = Number(volatilityThresholdBps);
    const currentVol = marketData.volatilityBps;

    const metrics = {
        volatilityBps: currentVol,
        maxRebalanceBps: Number(maxRebalanceBps),
        volatilityThresholdBps: volThreshold,
        minRunwayMonths: Number(minRunwayMonths)
    };
    
    if (currentVol > volThreshold) {
      return {
        actionNeeded: 'ALERT',
        reason: `Volatility ${currentVol}bps exceeds threshold ${volThreshold}bps`,
        currentMetrics: metrics
      };
    }
    
    // Add more logic here: e.g. check vault balances vs targets for REBALANCE
    
    return {
      actionNeeded: 'NONE',
      currentMetrics: metrics
    };

  } catch (error) {
    console.error("Risk Evaluation Failed:", error);
    throw error;
  }
}

