'use client'

import { Header } from '@/components/layout/Header'
import { AnalysisRequest } from '@/components/actions/AnalysisRequest'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function ActionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-frost-white">
               AI <span className="text-electric-teal">Actions</span>
             </h1>
             <p className="text-frost-white/60 mt-2">
               Request analysis and execute optimized treasury operations.
             </p>
          </div>
          <AnalysisRequest />
        </div>

        <div className="grid grid-cols-1 gap-6">
           <ActivityFeed />
        </div>
      </main>
    </div>
  )
}

