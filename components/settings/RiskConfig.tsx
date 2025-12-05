'use client'

import { useRiskParameters } from '@/hooks/blockchain/useRiskParameters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function RiskConfig() {
  const { parameters, updateParameters, isUpdating, isSuccess } = useRiskParameters()
  
  // Local state for inputs
  const [maxRebalance, setMaxRebalance] = useState('')
  const [volThreshold, setVolThreshold] = useState('')
  const [minRunway, setMinRunway] = useState('')

  useEffect(() => {
    if (parameters.maxRebalanceBps) setMaxRebalance(parameters.maxRebalanceBps.toString())
    if (parameters.volatilityThresholdBps) setVolThreshold(parameters.volatilityThresholdBps.toString())
    if (parameters.minRunwayMonths) setMinRunway(parameters.minRunwayMonths.toString())
  }, [parameters])

  const handleSave = () => {
    try {
      updateParameters(
        BigInt(maxRebalance || 0),
        BigInt(volThreshold || 0),
        BigInt(minRunway || 0)
      )
    } catch (e) {
      console.error("Invalid input", e)
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
            <label className="text-sm font-medium text-frost-white">Max Rebalance (BPS)</label>
            <Input 
              type="number" 
              value={maxRebalance} 
              onChange={(e) => setMaxRebalance(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
            />
            <p className="text-xs text-frost-white/50">100 BPS = 1%</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-frost-white">Volatility Threshold (BPS)</label>
             <Input 
              type="number" 
              value={volThreshold} 
              onChange={(e) => setVolThreshold(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-frost-white">Min Runway (Months)</label>
             <Input 
              type="number" 
              value={minRunway} 
              onChange={(e) => setMinRunway(e.target.value)}
              className="bg-white/5 border-white/10 text-frost-white"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isUpdating} className="btn-primary w-full">
          {isUpdating ? 'Updating...' : 'Update Parameters'}
        </Button>
        
        {isSuccess && <p className="text-success-green text-center text-sm">Parameters updated successfully!</p>}
      </CardContent>
    </Card>
  )
}

