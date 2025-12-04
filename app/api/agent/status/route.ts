import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/agent/telemetry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getRecentActivity();
    
    // Find last proposal and action
    const lastProposal = logs.find(l => l.type === 'PROPOSAL');
    const lastAction = logs.find(l => l.type === 'ACTION');

    return NextResponse.json({
        logs,
        lastProposal,
        lastAction,
        systemStatus: 'ONLINE'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
