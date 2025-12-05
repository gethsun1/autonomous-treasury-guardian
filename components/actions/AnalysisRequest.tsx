'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAgentStore } from '@/store/agent-store'
import { useTreasuryBalances } from '@/hooks/blockchain/useTreasuryBalances'
import { useRiskParameters } from '@/hooks/blockchain/useRiskParameters'
import { useExecuteAction } from '@/hooks/blockchain/useExecuteAction'
import { TOKENS } from '@/lib/tokens'
import { Loader2, Sparkles } from 'lucide-react'
import { useChainId, useAccount } from 'wagmi'
import { contracts } from '@/lib/contracts'
// import { fetchAgentAnalysis } from '@/lib/agent-api'

export function AnalysisRequest() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { lastProposal, isLoading, setLastProposal, setLoading } = useAgentStore()
  const { balances } = useTreasuryBalances()
  const { parameters } = useRiskParameters()
  const { executeRebalance, isExecuting } = useExecuteAction()
  const chainId = useChainId()
  const { address } = useAccount()

  const tokenList = useMemo(() => TOKENS[chainId as keyof typeof TOKENS] || [], [chainId])

  const symbolForAddress = (addr: string | undefined) => {
    if (!addr) return ''
    const token = tokenList.find(t => t.address.toLowerCase() === addr.toLowerCase())
    return token?.symbol || addr
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setIsOpen(true) 
    setError(null)
    try {
      const snapshot = {
        chainId,
        treasuryAddress: contracts.treasuryVault.address,
        balances,
        riskParameters: parameters,
        requester: address
      }
      
      console.log('Analyzing snapshot:', snapshot)

      const response = await fetch('/api/agent/propose', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Agent responded with ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'NO_ACTION' || !data.proposal) {
        setLastProposal(null)
        setError(data.error || 'Agent returned no actionable proposal')
        return
      }

      const proposal = data.proposal
      const reasoning = data.narrative || proposal.reason || 'No reasoning provided'

      const confidence = data.execution?.success ? 0.9 : 0.7

      const mappedProposal = {
        proposalId: data.execution?.actionId || proposal.reason || `proposal-${Date.now()}`,
        reasoning,
        confidence,
        actions: [
          {
            type: proposal.actionType,
            tokenFrom: symbolForAddress(proposal.tokenFrom),
            tokenTo: symbolForAddress(proposal.tokenTo),
            amount: proposal.amount
          }
        ]
      }

      setLastProposal(mappedProposal)
    } catch (error) {
      console.error(error)
      setError((error as Error).message || 'Failed to get analysis')
      setLastProposal(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = () => {
    if (!lastProposal || !lastProposal.actions.length) return
    
    const action = lastProposal.actions[0]
    if (action.type !== 'REBALANCE') return

    const tokenFrom = tokenList.find(t => t.symbol === action.tokenFrom)?.address
    const tokenTo = tokenList.find(t => t.symbol === action.tokenTo)?.address

    if (!tokenFrom || !tokenTo) {
      console.error('Token not found for chain', chainId)
      return
    }

    executeRebalance(
      tokenFrom,
      tokenTo,
      BigInt(action.amount),
      "0x", // Mock swap data
      lastProposal.proposalId
    )
  }

  return (
    <>
      <Button onClick={handleAnalyze} size="lg" className="btn-primary w-full md:w-auto">
        <Sparkles className="mr-2 h-4 w-4" />
        Request AI Analysis
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-midnight-indigo border-electric-teal/20 text-frost-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Agent Analysis</DialogTitle>
            <DialogDescription className="text-frost-white/60">
              Real-time assessment of treasury state and market conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-electric-teal" />
                <p className="text-sm text-frost-white/70">Analyzing on-chain data & market feeds...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-8 text-sm">
                {error}
              </div>
            ) : lastProposal ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-glass-gray border border-white/5">
                  <h4 className="font-bold text-electric-teal mb-2 flex items-center justify-between">
                    <span>Analysis Result</span>
                    <span className="text-xs bg-electric-teal/10 px-2 py-1 rounded text-electric-teal">
                      Confidence: {(lastProposal.confidence * 100).toFixed(0)}%
                    </span>
                  </h4>
                  <p className="text-sm leading-relaxed text-frost-white/80">
                    {lastProposal.reasoning}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-frost-white/70">Recommended Actions</h4>
                  {lastProposal.actions.map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 border-l-2 border-solar-gold">
                      <div className="text-sm">
                        <span className="font-bold">{action.type}</span>: {action.tokenFrom} → {action.tokenTo}
                      </div>
                      <div className="text-xs text-frost-white/50">
                        Amount: {action.amount} (wei)
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                   <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                   <Button 
                     onClick={handleExecute}
                     disabled={isExecuting}
                     className="bg-success-green hover:bg-success-green/80 text-midnight-indigo font-bold"
                   >
                     {isExecuting ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Executing...
                       </>
                     ) : (
                       "Proceed to Execution"
                     )}
                   </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-400">Failed to get analysis</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

