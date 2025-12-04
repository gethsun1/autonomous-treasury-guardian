import { NextResponse } from 'next/server';
import { evaluateRisk } from '@/lib/riskEngine';

export async function POST() {
  try {
    const analysis = await evaluateRisk();
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Agent Risk Check Failed:", error);
    return NextResponse.json(
      { error: 'Failed to evaluate risk', details: (error as Error).message },
      { status: 500 }
    );
  }
}

