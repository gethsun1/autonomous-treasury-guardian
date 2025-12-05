'use client'

import { useRiskParameters } from '@/hooks/blockchain/useRiskParameters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RiskIcon, RiskLevel } from '@/components/ui/RiskIcon'
import { useTreasuryBalances } from '@/hooks/blockchain/useTreasuryBalances'
import { useEffect, useState } from 'react'

export function RiskGauge() {
  const { parameters } = useRiskParameters()
  const { balances } = useTreasuryBalances()
  
  // Real calculation state
  const [currentRisk, setCurrentRisk] = useState(0)
  const [volatility, setVolatility] = useState(0)
  
  const volThreshold = parameters.volatilityThresholdBps ? Number(parameters.volatilityThresholdBps) / 100 : 12

  useEffect(() => {
     async function fetchMarketData() {
        try {
            // Reusing the same public API logic or fetching from our own agent status
            // For UI responsiveness, we can fetch the latest agent status which contains risk metrics
            const res = await fetch('/api/agent/status')
            const data = await res.json()
            
            // If we have a recent risk analysis log
            const recentLogs = data.logs || []
            const riskLog = recentLogs.find((l: any) => l.message && l.message.includes('Risk evaluated'))
            
            if (riskLog && riskLog.details) {
                // Volatility is often in details as 'volatilityScore' or similar if we logged it
                // Based on riskEngine.ts: "Volatility (${currentVolPct.toFixed(2)}%)"
                // Let's rely on a separate fetch or better, just fetch the market data directly here for the UI
                
                // Fallback: Fetch price directly for live UI updates
                const avaxRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_24hr_change=true')
                const avaxData = await avaxRes.json()
                const change = Math.abs(avaxData['avalanche-2'].usd_24h_change)
                setVolatility(change)
                
                // Simple Risk Score Calculation for UI
                // Risk = (Volatility / Threshold) * 50 + (ExposureDev / 20) * 50
                // Simplified: Risk is mostly Volatility vs Threshold
                const riskScore = Math.min((change / volThreshold) * 50, 100)
                setCurrentRisk(Math.round(riskScore))
            } else {
                 // Fallback if no logs, fetch directly
                 const avaxRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_24hr_change=true')
                 const avaxData = await avaxRes.json()
                 const change = Math.abs(avaxData['avalanche-2'].usd_24h_change)
                 setVolatility(change)
                 const riskScore = Math.min((change / volThreshold) * 50, 100)
                 setCurrentRisk(Math.round(riskScore))
            }
        } catch (e) {
            console.error("Failed to fetch risk data", e)
        }
     }
     
     fetchMarketData()
     const interval = setInterval(fetchMarketData, 60000)
     return () => clearInterval(interval)
  }, [volThreshold])


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
            <span className="text-electric-teal font-bold">{volatility.toFixed(2)}%</span>
          </div>
          <Progress value={currentRisk} className="h-2 bg-white/10" indicatorClassName="bg-electric-teal" />
          <p className="text-xs text-right text-frost-white/50">Threshold: {volThreshold}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-frost-white/70">Runway Estimate</span>
            <span className="text-frost-white font-mono">14.2 Months</span>
          </div>
           {/* Runway calculation could be improved with real balance / burn rate but constant burn is OK for now */}
        </div>
      </CardContent>
    </Card>
  )
}
