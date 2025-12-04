'use client'

import { Header } from '@/components/layout/Header'
import { RiskConfig } from '@/components/settings/RiskConfig'
import { RoleManager } from '@/components/settings/RoleManager'

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-frost-white">
          System <span className="text-electric-teal">Settings</span>
        </h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <RiskConfig />
          <RoleManager />
        </div>
      </main>
    </div>
  )
}
