'use client'

import { useState } from 'react'
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
  const { lastProposal, isLoading, setLastProposal, setLoading } = useAgentStore()
  const { balances } = useTreasuryBalances()
  const { parameters } = useRiskParameters()
  const { executeRebalance, isExecuting } = useExecuteAction()
  const chainId = useChainId()
  const { address } = useAccount()

  const handleAnalyze = async () => {
    setLoading(true)
    setIsOpen(true) 
    try {
      const snapshot = {
        chainId,
        treasuryAddress: contracts.treasuryVault.address,
        balances,
        riskParameters: parameters,
        requester: address
      }
      
      console.log('Analyzing snapshot:', snapshot)

      // Mock response if backend not available for demo
      // const result = await fetchAgentAnalysis(snapshot)
      
      // Simulated delay + mock result
      await new Promise(resolve => setTimeout(resolve, 2000))
      const result = {
        proposalId: '0x' + Math.random().toString(16).slice(2),
        reasoning: "Volatility in AVAX suggests a rebalance to USDC is prudent to maintain risk parity. Current exposure exceeds 15% threshold.",
        confidence: 0.92,
        actions: [
          { type: 'REBALANCE', tokenFrom: 'WAVAX', tokenTo: 'USDC', amount: '1000000000000000000' }
        ]
      }
      
      setLastProposal(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = () => {
    if (!lastProposal || !lastProposal.actions.length) return
    
    const action = lastProposal.actions[0]
    if (action.type !== 'REBALANCE') return

    const tokenList = TOKENS[chainId as keyof typeof TOKENS] || []
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

