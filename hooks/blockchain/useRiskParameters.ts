import { useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from '@/lib/contracts';

export function useRiskParameters() {
  const contract = {
    address: contracts.riskParameters.address,
    abi: contracts.riskParameters.abi
  };

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'maxRebalanceBps' },
      { ...contract, functionName: 'volatilityThresholdBps' },
      { ...contract, functionName: 'minRunwayMonths' }
    ]
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const updateParameters = (maxRebalance: bigint, volatility: bigint, runway: bigint) => {
    writeContract({
      ...contract,
      functionName: 'updateParameters',
      args: [maxRebalance, volatility, runway]
    });
  };

  return {
    parameters: {
      maxRebalanceBps: data?.[0]?.result,
      volatilityThresholdBps: data?.[1]?.result,
      minRunwayMonths: data?.[2]?.result
    },
    isLoading,
    refetch,
    updateParameters,
    isUpdating: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
}

