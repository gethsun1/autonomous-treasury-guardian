import { logActivity } from './telemetry';

interface MarketMetrics {
  price: number;
  volatility: number; // 24h volatility score (0-100 normalized or basis points)
  change24h: number;
  lastUpdated: number;
}

// Simple in-memory cache
let cache: Record<string, MarketMetrics> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getMarketMetrics(tokenId: 'avalanche-2' | 'usd-coin'): Promise<MarketMetrics> {
  const now = Date.now();
  
  if (cache[tokenId] && (now - cache[tokenId].lastUpdated < CACHE_TTL)) {
    return cache[tokenId];
  }

  try {
    // Fetch simple price and 24h change
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`Coingecko API error: ${res.statusText}`);
    
    const data = await res.json();
    const tokenData = data[tokenId];

    if (!tokenData) throw new Error('Token data not found');

    // Calculate a simple volatility proxy based on absolute 24h change
    // Real volatility requires historical candles, but for this hackathon/demo:
    // Volatility Score = |24h Change %| * Multiplier (e.g. 100 basis points per 1% change)
    const changeAbs = Math.abs(tokenData.usd_24h_change);
    const volatilityBps = Math.min(changeAbs * 100, 10000); // Cap at 100% equivalent

    const metrics: MarketMetrics = {
      price: tokenData.usd,
      change24h: tokenData.usd_24h_change,
      volatility: volatilityBps,
      lastUpdated: now
    };

    cache[tokenId] = metrics;
    return metrics;

  } catch (error: any) {
    await logActivity('ERROR', `Failed to fetch market data for ${tokenId}`, { error: error.message });
    
    // Return stale cache if available, otherwise mock fallback
    if (cache[tokenId]) return cache[tokenId];

    // Fallback / Mock for demo continuity if API fails completely
    console.warn(`Using fallback market data for ${tokenId}`);
    return {
      price: tokenId === 'usd-coin' ? 1.0 : 35.50, // Approximate fallback
      change24h: 0,
      volatility: 200, // Low volatility assumption
      lastUpdated: now
    };
  }
}

export async function getAllMarketData() {
  const avax = await getMarketMetrics('avalanche-2');
  const usdc = await getMarketMetrics('usd-coin');
  
  return {
    AVAX: avax,
    USDC: usdc,
    timestamp: Date.now()
  };
}
