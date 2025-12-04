'use client'

import { wagmiAdapter, projectId, networks } from '@/lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { State, WagmiProvider } from 'wagmi'
import React, { ReactNode } from 'react'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as [typeof networks[0], ...typeof networks],
  projectId,
  features: {
    analytics: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00E0C7',
    '--w3m-border-radius-master': '2px'
  }
})

export function Providers({ children, initialState }: { children: ReactNode, initialState?: State }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

