import { describe, it, expect } from 'vitest'
import { contracts } from '@/lib/contracts'

describe('Contracts Configuration', () => {
  it('should have treasuryVault address', () => {
    expect(contracts.treasuryVault.address).toBeDefined()
  })
  it('should have actionExecutor abi', () => {
    expect(contracts.actionExecutor.abi).toBeDefined()
    expect(Array.isArray(contracts.actionExecutor.abi)).toBe(true)
  })
})

