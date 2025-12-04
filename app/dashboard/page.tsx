'use client'

import { Header } from '@/components/layout/Header'
import { TreasuryOverview } from '@/components/dashboard/TreasuryOverview'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-frost-white">
            Treasury <span className="text-electric-teal">Command Center</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <TreasuryOverview />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-card p-6 h-64 flex items-center justify-center text-frost-white/30 border border-dashed border-white/10">
                 Allocation Chart (Coming Soon)
               </div>
               <div className="glass-card p-6 h-64 flex items-center justify-center text-frost-white/30 border border-dashed border-white/10">
                 Runway Projection (Coming Soon)
               </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <RiskGauge />
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  )
}

