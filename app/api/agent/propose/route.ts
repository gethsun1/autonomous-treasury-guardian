import { NextResponse } from 'next/server';
import { createWalletClient, http, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import { contracts } from '@/lib/contracts';

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as `0x${string}`;

export async function POST(request: Request) {
  try {
    if (!AGENT_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Agent private key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { actionType, tokenFrom, tokenTo, amount, reason } = body;

    if (!actionType || !amount) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = privateKeyToAccount(AGENT_PRIVATE_KEY);
    const client = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http()
    });

    // Generate a unique ID
    const id = keccak256(toBytes(Date.now().toString() + Math.random().toString()));

    // Call proposeAction
    const hash = await client.writeContract({
      address: contracts.actionExecutor.address,
      abi: contracts.actionExecutor.abi,
      functionName: 'proposeAction',
      args: [
        id,
        actionType,
        tokenFrom || "0x0000000000000000000000000000000000000000",
        tokenTo || "0x0000000000000000000000000000000000000000",
        BigInt(amount),
        reason || "AI proposed action"
      ]
    });

    return NextResponse.json({ success: true, txHash: hash, actionId: id });

  } catch (error) {
    console.error("Agent Proposal Failed:", error);
    return NextResponse.json(
      { error: 'Failed to propose action', details: (error as Error).message },
      { status: 500 }
    );
  }
}

