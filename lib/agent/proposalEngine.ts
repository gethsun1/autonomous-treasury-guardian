import { RiskAnalysis } from './riskEngine';
import { ActionProposal } from './executor';
import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { contracts } from '@/lib/contracts';
import { TOKENS } from '@/lib/tokens';
import { logActivity } from './telemetry';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

export async function generateProposal(risk: RiskAnalysis): Promise<ActionProposal | null> {
  if (risk.recommendedAction === 'DO_NOTHING' || risk.recommendedAction === 'TOP_UP') {
    // TOP_UP is a user action, agent cannot propose a transaction to top itself up from nowhere (unless pulling from another vault, which is out of scope).
    // So we return null for on-chain proposals.
    return null;
  }

  try {
    // We need to construct a REBALANCE proposal
    // 1. Get current balances to calculate delta
    const fujiTokens = TOKENS[avalancheFuji.id];
    const avaxToken = fujiTokens.find(t => t.symbol === 'WAVAX')!;
    const usdcToken = fujiTokens.find(t => t.symbol === 'USDC')!;

    const [avaxBal, usdcBal] = await Promise.all([
        publicClient.readContract({ address: contracts.treasuryVault.address, abi: contracts.treasuryVault.abi, functionName: 'balanceOf', args: [avaxToken.address as `0x${string}`] }),
        publicClient.readContract({ address: contracts.treasuryVault.address, abi: contracts.treasuryVault.abi, functionName: 'balanceOf', args: [usdcToken.address as `0x${string}`] })
    ]) as [bigint, bigint];

    // 2. Determine Direction
    // If Volatility is reason -> Reduce Risk (Sell AVAX)
    // If Exposure High -> Sell AVAX
    // If Exposure Low -> Buy AVAX
    
    let tokenFrom = '';
    let tokenTo = '';
    let amount = 0n;
    let reason = '';

    const isVolHigh = risk.breachReasons.some(r => r.includes('Volatility'));
    const isAvaxHigh = risk.metrics.avaxExposurePct > 70;
    const isAvaxLow = risk.metrics.avaxExposurePct < 30;

    if (isVolHigh || isAvaxHigh) {
        // Sell AVAX for USDC
        tokenFrom = avaxToken.address;
        tokenTo = usdcToken.address;
        reason = isVolHigh ? 'High volatility detected - Reducing exposure' : 'Rebalancing AVAX overweight';
        
        // Calculate amount to sell
        // Target: Reduce to 50% (or 20% if Vol high)
        // For simplicity: Sell 10% of holding or max allowed
        const balance = avaxBal;
        const maxBps = BigInt(Math.floor(risk.metrics.maxRebalancePct * 100)); // bps from metrics which was % * 100? wait risk metrics has %, contract has bps.
        // Risk metrics: maxRebalancePct (e.g. 50 means 50%). 
        // Let's check riskEngine.ts: maxRebalancePct: Number(maxRebalanceBps) / 100. So 5000 bps -> 50%.
        
        // Let's take a conservative step: Swap 25% of current holding
        let amountToSwap = balance / 4n;
        
        // Cap at maxRebalanceBps of the vault balance
        // The contract `executeRebalance` checks: amountFrom <= (vaultBal * maxRebalanceBps) / 10000
        // So we should ensure we don't exceed it to avoid revert.
        const maxAllowed = (balance * BigInt(Math.floor(risk.metrics.maxRebalancePct * 100))) / 10000n;
        
        if (amountToSwap > maxAllowed) {
            amountToSwap = maxAllowed;
            reason += ' (Capped by risk parameters)';
        }
        
        amount = amountToSwap;

    } else if (isAvaxLow) {
        // Sell USDC for AVAX
        tokenFrom = usdcToken.address;
        tokenTo = avaxToken.address;
        reason = 'Rebalancing AVAX underweight';

        const balance = usdcBal;
        let amountToSwap = balance / 4n;
        
        const maxAllowed = (balance * BigInt(Math.floor(risk.metrics.maxRebalancePct * 100))) / 10000n;
        
        if (amountToSwap > maxAllowed) amountToSwap = maxAllowed;
        
        amount = amountToSwap;
    }

    if (amount === 0n) {
        await logActivity('INFO', 'Proposal generated but amount is 0 (likely empty vault)');
        return null;
    }

    const proposal: ActionProposal = {
        actionType: 'REBALANCE',
        tokenFrom,
        tokenTo,
        amount: amount.toString(),
        reason
    };

    await logActivity('PROPOSAL', `Generated proposal: ${reason}`, proposal);
    return proposal;

  } catch (error: any) {
    await logActivity('ERROR', 'Proposal generation failed', { error: error.message });
    return null;
  }
}
