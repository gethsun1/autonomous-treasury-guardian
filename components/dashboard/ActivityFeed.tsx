'use client'

import { useAiEvents } from '@/hooks/blockchain/useAiEvents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskIcon } from '@/components/ui/RiskIcon'
import { useEffect, useState } from 'react'

export function ActivityFeed() {
  const { events: onChainEvents } = useAiEvents()
  const [agentLogs, setAgentLogs] = useState<any[]>([])

  useEffect(() => {
    async function fetchAgentLogs() {
        try {
            const res = await fetch('/api/agent/status')
            const data = await res.json()
            if (data.logs) {
                setAgentLogs(data.logs)
            }
        } catch (e) {
            console.error("Failed to fetch agent logs", e)
        }
    }
    fetchAgentLogs()
    const interval = setInterval(fetchAgentLogs, 15000) // Poll more frequently for logs
    return () => clearInterval(interval)
  }, [])

  // Combine and sort events
  // We want to show narratives and decisions from the server-side agent alongside on-chain events
  const combinedEvents = [
      ...onChainEvents.map(e => ({
          ...e,
          source: 'CHAIN',
          timestamp: Number(e.timestamp || 0) * 1000 || Date.now() // Fallback if no timestamp
      })),
      ...agentLogs.filter(l => l.type === 'NARRATIVE' || l.type === 'ACTION' || l.type === 'PROPOSAL').map(l => ({
          type: l.type === 'NARRATIVE' ? 'Narrative' : (l.type === 'ACTION' ? 'ActionExecuted' : 'ActionProposed'),
          actionType: l.type === 'NARRATIVE' ? 'AI Reasoning' : (l.details?.actionType || 'System Action'),
          reason: l.message,
          timestamp: l.timestamp,
          source: 'AGENT',
          txHash: l.details?.txHash
      }))
  ].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <Card className="glass-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-frost-white">AI Decision Log</CardTitle>
        <div className="flex items-center gap-2" title="System Vigilance Level">
           <RiskIcon level="LOW" className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {combinedEvents.length === 0 ? (
            <div className="text-center text-frost-white/40 py-8">
              Waiting for AI actions...
            </div>
          ) : (
            combinedEvents.map((event, i) => (
              <div key={(event.txHash || event.timestamp) + i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant={event.type === 'ActionExecuted' ? 'default' : (event.type === 'Narrative' ? 'secondary' : 'outline')} 
                         className={
                             event.type === 'ActionExecuted' ? 'bg-success-green text-midnight-indigo' : 
                             event.type === 'Narrative' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' :
                             'text-electric-teal border-electric-teal'
                         }>
                    {event.type === 'ActionExecuted' ? 'Executed' : (event.type === 'Narrative' ? 'AI Insight' : 'Proposed')}
                  </Badge>
                  <span className="text-xs text-frost-white/50">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-frost-white">
                  {event.actionType}
                </p>
                {event.reason && (
                  <p className="text-xs text-frost-white/70 italic">
                    &quot;{event.reason}&quot;
                  </p>
                )}
                {event.txHash && (
                    <div className="text-xs text-frost-white/40 truncate">
                    Tx: {event.txHash}
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
