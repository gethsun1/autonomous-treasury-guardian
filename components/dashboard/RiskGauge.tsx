'use client'

import { useRiskParameters } from '@/hooks/blockchain/useRiskParameters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RiskIcon, RiskLevel } from '@/components/ui/RiskIcon'

export function RiskGauge() {
  const { parameters } = useRiskParameters()
  
  // Mock calculated risk (0-100). In reality would be derived from vol vs threshold.
  const currentRisk = 45 
  const volThreshold = parameters.volatilityThresholdBps ? Number(parameters.volatilityThresholdBps) / 100 : 12

  const getRiskLevel = (risk: number): RiskLevel => {
    if (risk < 25) return "LOW"
    if (risk < 50) return "MEDIUM"
    if (risk < 75) return "HIGH"
    return "CRITICAL"
  }

  const riskLevel = getRiskLevel(currentRisk)

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-frost-white">Risk Monitor</CardTitle>
        <RiskIcon level={riskLevel} className="w-8 h-8" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-frost-white/70">Current Volatility</span>
            <span className="text-electric-teal font-bold">5.2%</span>
          </div>
          <Progress value={35} className="h-2 bg-white/10" indicatorClassName="bg-electric-teal" />
          <p className="text-xs text-right text-frost-white/50">Threshold: {volThreshold}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-frost-white/70">Exposure Level</span>
            <span className="text-solar-gold font-bold">Moderate</span>
          </div>
          <Progress value={currentRisk} className="h-2 bg-white/10" indicatorClassName="bg-solar-gold" />
        </div>
      </CardContent>
    </Card>
  )
}

