import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from '@/lib/contracts';

export function useExecuteAction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const executeRebalance = (
    tokenFrom: string,
    tokenTo: string,
    amountFrom: bigint,
    swapData: string,
    actionId: string
  ) => {
    writeContract({
      address: contracts.actionExecutor.address,
      abi: contracts.actionExecutor.abi,
      functionName: 'executeRebalance',
      args: [tokenFrom, tokenTo, amountFrom, swapData as `0x${string}`, actionId as `0x${string}`]
    });
  };

  const executePayment = (
    token: string,
    recipient: string,
    amount: bigint,
    actionId: string
  ) => {
    writeContract({
      address: contracts.actionExecutor.address,
      abi: contracts.actionExecutor.abi,
      functionName: 'executePayment',
      args: [token, recipient, amount, actionId as `0x${string}`]
    });
  };

  const claimSessionAndExecute = (sessionId: string, execPayload: string) => {
    writeContract({
      address: contracts.actionExecutor.address,
      abi: contracts.actionExecutor.abi,
      functionName: 'claimSessionAndExecute',
      args: [sessionId as `0x${string}`, execPayload as `0x${string}`]
    });
  };

  return {
    executeRebalance,
    executePayment,
    claimSessionAndExecute,
    isExecuting: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

