'use client'

import { useRiskParameters } from '@/hooks/blockchain/useRiskParameters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function RiskConfig() {
  const { parameters, updateParameters, isUpdating, isSuccess, error, refetch } = useRiskParameters()
  
  // Local state for inputs
  const [maxRebalancePct, setMaxRebalancePct] = useState('')
  const [volThresholdPct, setVolThresholdPct] = useState('')
  const [minRunway, setMinRunway] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (parameters.maxRebalanceBps !== undefined) setMaxRebalancePct((Number(parameters.maxRebalanceBps) / 100).toString())
    if (parameters.volatilityThresholdBps !== undefined) setVolThresholdPct((Number(parameters.volatilityThresholdBps) / 100).toString())
    if (parameters.minRunwayMonths) setMinRunway(parameters.minRunwayMonths.toString())
  }, [parameters])

  const handleSave = () => {
    try {
      setLocalError(null)
      const maxRebalanceBps = BigInt(Math.round((parseFloat(maxRebalancePct || '0')) * 100))
      const volThresholdBps = BigInt(Math.round((parseFloat(volThresholdPct || '0')) * 100))
      const minRunwayMonths = BigInt(Math.round(parseFloat(minRunway || '0')))

      updateParameters(maxRebalanceBps, volThresholdBps, minRunwayMonths)
      // optimistic refresh after tx settles
      setTimeout(() => refetch(), 2000)
    } catch (e) {
      console.error("Invalid input", e)
      setLocalError('Please enter valid numeric values.')
    }
  }

  return (
    <Card className="glass-card max-w-2xl">
      <CardHeader>
        <CardTitle className="text-frost-white">Risk Parameters (On-Chain)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-frost-white">Max Rebalance (%)</label>
            <Input 
              type="number" 
              value={maxRebalancePct} 
              onChange={(e) => setMaxRebalancePct(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
              step="0.01"
            />
            <p className="text-xs text-frost-white/50">Example: 12.5 = 12.5% (written on-chain as BPS)</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-frost-white">Volatility Threshold (%)</label>
             <Input 
              type="number" 
              value={volThresholdPct} 
              onChange={(e) => setVolThresholdPct(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-frost-white">Min Runway (Months)</label>
             <Input 
              type="number" 
              value={minRunway} 
              onChange={(e) => setMinRunway(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
              step="1"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isUpdating} className="btn-primary w-full">
          {isUpdating ? 'Updating...' : 'Update Parameters'}
        </Button>
        
        {isSuccess && <p className="text-success-green text-center text-sm">Parameters updated successfully!</p>}
        {(localError || error) && (
          <p className="text-red-400 text-center text-sm">{localError || error?.message}</p>
        )}
      </CardContent>
    </Card>
  )
}

