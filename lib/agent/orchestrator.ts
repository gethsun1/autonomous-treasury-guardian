import { getAllMarketData } from './marketData';
import { evaluateRisk, RiskAnalysis } from './riskEngine';
import { generateProposal } from './proposalEngine';
import { submitActionProposal, ExecutionResult, ActionProposal } from './executor';
import { logActivity } from './telemetry';

export interface AgentResult {
  status: 'SUCCESS' | 'NO_ACTION' | 'FAILED';
  riskAnalysis?: RiskAnalysis;
  proposal?: ActionProposal | null;
  execution?: ExecutionResult;
  error?: string;
}

/**
 * Run only the risk analysis phase (read-only)
 */
export async function runRiskCheck(): Promise<AgentResult> {
  try {
    await logActivity('INFO', 'Starting Risk Check...');
    const marketData = await getAllMarketData();
    const riskAnalysis = await evaluateRisk(marketData);
    
    return {
      status: 'SUCCESS',
      riskAnalysis
    };
  } catch (error: any) {
    return {
      status: 'FAILED',
      error: error.message
    };
  }
}

/**
 * Run the full agent cycle: Monitor -> Analyze -> Propose -> Execute
 */
export async function runAgentCycle(): Promise<AgentResult> {
  try {
    await logActivity('INFO', 'Starting Agent Cycle...');
    
    // 1. Market Data
    const marketData = await getAllMarketData();
    
    // 2. Risk Analysis
    const riskAnalysis = await evaluateRisk(marketData);
    
    if (riskAnalysis.riskLevel === 'LOW' && riskAnalysis.recommendedAction === 'DO_NOTHING') {
        await logActivity('INFO', 'Risk level LOW. No action needed.');
        return { status: 'NO_ACTION', riskAnalysis };
    }

    // 3. Proposal Generation
    // Even if risk is MEDIUM, we might want to rebalance if it helps
    const proposal = await generateProposal(riskAnalysis);

    if (!proposal) {
        await logActivity('INFO', 'No actionable proposal generated.');
        return { status: 'NO_ACTION', riskAnalysis };
    }

    // 4. Execution (Proposal Submission)
    const execution = await submitActionProposal(proposal);

    return {
        status: execution.success ? 'SUCCESS' : 'FAILED',
        riskAnalysis,
        proposal,
        execution
    };

  } catch (error: any) {
    await logActivity('ERROR', 'Agent Cycle Failed', { error: error.message });
    return {
        status: 'FAILED',
        error: error.message
    };
  }
}
