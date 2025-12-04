import { NextResponse } from 'next/server';
import { runAgentCycle } from '@/lib/agent/orchestrator';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // We ignore the body for the autonomous agent flow
    // The agent decides based on chain state + market data
    
    const result = await runAgentCycle();
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Agent Proposal Failed:", error);
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: (error as Error).message },
      { status: 500 }
    );
  }
}
