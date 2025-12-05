'use client'

import { useTreasuryBalances } from '@/hooks/blockchain/useTreasuryBalances'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TreasuryOverview() {
  const { balances, isLoading } = useTreasuryBalances()

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-frost-white">Treasury Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full bg-white/5" />
              <Skeleton className="h-12 w-full bg-white/5" />
            </>
          ) : (
            balances.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                    {token.symbol[0]}
                  </div>
                  <div>
                    <p className="font-medium text-frost-white">{token.symbol}</p>
                    <p className="text-xs text-frost-white/60">Avalanche</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-frost-white">{parseFloat(token.balance).toLocaleString()}</p>
                  <p className="text-xs text-frost-white/60">
                    {token.symbol === 'USDC' ? '$1.00' : 'Price N/A'}
                  </p>
                </div>
              </div>
            ))
          )}
          {!isLoading && balances.length === 0 && (
             <div className="text-center text-sm text-frost-white/50 py-4">
                No assets found
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

