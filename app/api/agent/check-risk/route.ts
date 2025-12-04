import { NextResponse } from 'next/server';
import { runRiskCheck } from '@/lib/agent/orchestrator';

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function POST() {
  try {
    const result = await runRiskCheck();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent Risk Check Failed:", error);
    return NextResponse.json(
      { error: 'Failed to evaluate risk', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
    return POST();
}
