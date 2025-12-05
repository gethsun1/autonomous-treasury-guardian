import { createWalletClient, createPublicClient, http, Hash, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import { contracts } from '@/lib/contracts';
import { logActivity } from './telemetry';

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;

// Helper to validate private key format
const isValidPrivateKey = (key: string | undefined): key is `0x${string}` => {
    // Basic check: starts with 0x and has correct length for 32 bytes (64 chars + 0x = 66)
    // Allow skipping length check if just checking for existence/prefix during build, 
    // but strictly viem requires 32 bytes. 
    // For safety during build, if it looks fake or short, we skip it.
    return !!key && key.startsWith('0x') && key.length === 66;
};

if (!isValidPrivateKey(AGENT_PRIVATE_KEY)) {
  console.warn('AGENT_PRIVATE_KEY is missing or invalid. Executor will be disabled.');
}

// Initialize Clients
const account = isValidPrivateKey(AGENT_PRIVATE_KEY) ? privateKeyToAccount(AGENT_PRIVATE_KEY) : undefined;

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

const walletClient = account ? createWalletClient({
  account,
  chain: avalancheFuji,
  transport: http(),
}) : null;

export interface ActionProposal {
  actionType: string;
  tokenFrom: string;
  tokenTo: string;
  amount: string;
  reason: string;
}

export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  actionId?: string;
  error?: string;
}

export async function submitActionProposal(proposal: ActionProposal): Promise<ExecutionResult> {
  if (!walletClient || !account) {
    const error = 'Agent wallet not configured (missing or invalid private key)';
    await logActivity('ERROR', error);
    return { success: false, error };
  }

  const actionId = keccak256(toBytes(Date.now().toString() + Math.random().toString()));

  try {
    await logActivity('INFO', `Submitting proposal: ${proposal.actionType}`, { 
      ...proposal, 
      actionId 
    });

    // Ensure default zero address for optional fields if empty strings provided
    const tokenFrom = proposal.tokenFrom || "0x0000000000000000000000000000000000000000";
    const tokenTo = proposal.tokenTo || "0x0000000000000000000000000000000000000000";

    const hash = await walletClient.writeContract({
      address: contracts.actionExecutor.address,
      abi: contracts.actionExecutor.abi,
      functionName: 'proposeAction',
      args: [
        actionId,
        proposal.actionType,
        tokenFrom as `0x${string}`,
        tokenTo as `0x${string}`,
        BigInt(proposal.amount),
        proposal.reason
      ]
    });

    await logActivity('ACTION', `Proposal submitted on-chain`, { txHash: hash, actionId });

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
        return { success: true, txHash: hash, actionId };
    } else {
        const error = 'Transaction reverted on-chain';
        await logActivity('ERROR', error, { txHash: hash });
        return { success: false, txHash: hash, error };
    }

  } catch (error: any) {
    const msg = `Execution failed: ${error.message}`;
    await logActivity('ERROR', msg);
    return { success: false, error: msg };
  }
}

export function getAgentAddress(): string | undefined {
    return account?.address;
}
