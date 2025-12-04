import { useReadContracts, useBalance, useChainId } from 'wagmi';
import { contracts } from '@/lib/contracts';
import { TOKENS } from '@/lib/tokens';
import { erc20Abi, formatUnits } from 'viem';
import { useMemo } from 'react';

export function useTreasuryBalances() {
  const chainId = useChainId();
  const tokenList = TOKENS[chainId as keyof typeof TOKENS] || [];
  const treasuryAddress = contracts.treasuryVault.address;

  // Native AVAX balance
  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address: treasuryAddress,
    chainId
  });

  // ERC20 Balances
  const { data: tokenBalances, refetch: refetchTokens, isLoading } = useReadContracts({
    contracts: tokenList.map(token => ({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [treasuryAddress]
    }))
  });

  const balances = useMemo(() => {
    const mappedTokens = tokenList.map((token, index) => {
      const raw = tokenBalances?.[index]?.result as bigint | undefined;
      const formatted = raw ? formatUnits(raw, token.decimals) : '0';
      return {
        ...token,
        balance: formatted,
        rawBalance: raw || 0n
      };
    });

    if (nativeBalance) {
      mappedTokens.unshift({
        symbol: nativeBalance.symbol,
        address: '0x0000000000000000000000000000000000000000',
        decimals: nativeBalance.decimals,
        balance: formatUnits(nativeBalance.value, nativeBalance.decimals),
        rawBalance: nativeBalance.value
      });
    }

    return mappedTokens;
  }, [tokenList, tokenBalances, nativeBalance]);

  const refresh = () => {
    refetchNative();
    refetchTokens();
  };

  return { balances, isLoading, refresh };
}

