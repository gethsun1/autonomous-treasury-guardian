import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from '@/lib/contracts';
import { erc20Abi } from 'viem';

export function useTreasuryActions() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const deposit = (token: string, amount: bigint) => {
    writeContract({
      address: contracts.treasuryVault.address,
      abi: contracts.treasuryVault.abi,
      functionName: 'deposit',
      args: [token as `0x${string}`, amount]
    });
  };

  const withdraw = (token: string, to: string, amount: bigint) => {
    writeContract({
      address: contracts.treasuryVault.address,
      abi: contracts.treasuryVault.abi,
      functionName: 'withdraw',
      args: [token as `0x${string}`, to as `0x${string}`, amount]
    });
  };

  // Helper to approve token for deposit
  const approve = (token: string, amount: bigint) => {
      writeContract({
          address: token as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [contracts.treasuryVault.address, amount]
      });
  };

  return {
    deposit,
    withdraw,
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

