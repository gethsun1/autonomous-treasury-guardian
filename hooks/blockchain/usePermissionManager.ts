import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from '@/lib/contracts';

export enum Role {
  NONE = 0,
  GOVERNANCE = 1,
  EXECUTOR = 2,
  AGENT = 3
}

export function usePermissionManager() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const assignRole = (who: string, role: Role) => {
    writeContract({
      address: contracts.permissionManager.address,
      abi: contracts.permissionManager.abi,
      functionName: 'assignRole',
      args: [who as `0x${string}`, role]
    });
  };

  const revokeRole = (who: string) => {
    writeContract({
      address: contracts.permissionManager.address,
      abi: contracts.permissionManager.abi,
      functionName: 'revokeRole',
      args: [who as `0x${string}`]
    });
  };

  const useGetRole = (who: string) => {
      return useReadContract({
          address: contracts.permissionManager.address,
          abi: contracts.permissionManager.abi,
          functionName: 'getRole',
          args: [who as `0x${string}`],
          query: { enabled: !!who }
      });
  };

  return {
    assignRole,
    revokeRole,
    useGetRole,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

