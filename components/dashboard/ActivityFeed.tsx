'use client'

import { useAiEvents } from '@/hooks/blockchain/useAiEvents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ActivityFeed() {
  const { events } = useAiEvents()

  return (
    <Card className="glass-card border-none h-full">
      <CardHeader>
        <CardTitle className="text-frost-white">AI Decision Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-center text-frost-white/40 py-8">
              Waiting for AI actions...
            </div>
          ) : (
            events.map((event, i) => (
              <div key={event.txHash + event.id + i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant={event.type === 'ActionExecuted' ? 'default' : 'outline'} 
                         className={event.type === 'ActionExecuted' ? 'bg-success-green text-midnight-indigo' : 'text-electric-teal border-electric-teal'}>
                    {event.type === 'ActionExecuted' ? 'Executed' : 'Proposed'}
                  </Badge>
                  <span className="text-xs text-frost-white/50">
                    {new Date(Number(event.timestamp) * 1000).toLocaleTimeString()}
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
                <div className="text-xs text-frost-white/40 truncate">
                  Tx: {event.txHash}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

