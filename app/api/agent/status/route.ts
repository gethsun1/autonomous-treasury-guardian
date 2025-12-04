import { NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as `0x${string}`;

export async function GET() {
  try {
    if (!AGENT_PRIVATE_KEY) {
      return NextResponse.json({ status: 'misconfigured', error: 'Agent private key missing' });
    }

    const account = privateKeyToAccount(AGENT_PRIVATE_KEY);
    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http()
    });

    const balance = await publicClient.getBalance({ address: account.address });

    return NextResponse.json({
      status: 'active',
      address: account.address,
      balance: formatEther(balance),
      network: avalancheFuji.name
    });

  } catch (error) {
    return NextResponse.json(
      { status: 'error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

