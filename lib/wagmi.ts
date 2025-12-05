import { cookieStorage, createStorage, http } from 'wagmi'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // Public testing ID

export const networks = [avalanche, avalancheFuji]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig

// Force override transports after config creation to ensure they are respected
config.transports[avalanche.id] = http('https://api.avax.network/ext/bc/C/rpc')({ chain: avalanche })
config.transports[avalancheFuji.id] = http('https://api.avax-test.network/ext/bc/C/rpc')({ chain: avalancheFuji })


