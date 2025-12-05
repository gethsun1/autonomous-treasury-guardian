'use client'

import { useState } from 'react'
import { usePermissionManager, Role } from '@/hooks/blockchain/usePermissionManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function RoleManager() {
  const { assignRole, revokeRole, isPending, isSuccess, error } = usePermissionManager()
  
  const [targetAddress, setTargetAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>(Role.AGENT.toString())
  
  const handleAssign = () => {
    if (!targetAddress) return
    assignRole(targetAddress, Number(selectedRole))
  }

  const handleRevoke = () => {
    if (!targetAddress) return
    revokeRole(targetAddress)
  }

  return (
    <Card className="glass-card max-w-2xl">
      <CardHeader>
        <CardTitle className="text-frost-white">Access Control & Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assign" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
            <TabsTrigger value="assign">Assign Role</TabsTrigger>
            <TabsTrigger value="revoke">Revoke Role</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assign" className="space-y-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-frost-white">Wallet Address</label>
              <Input 
                placeholder="0x..." 
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="bg-white/5 border-white/10 text-frost-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-frost-white">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-white/5 border-white/10 text-frost-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.AGENT.toString()}>AI Agent (Role 3)</SelectItem>
                  <SelectItem value={Role.EXECUTOR.toString()}>Executor (Role 2)</SelectItem>
                  <SelectItem value={Role.GOVERNANCE.toString()}>Governance (Role 1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssign} 
              disabled={isPending || !targetAddress} 
              className="w-full btn-primary mt-4"
            >
              {isPending ? 'Processing...' : 'Grant Permission'}
            </Button>
          </TabsContent>

          <TabsContent value="revoke" className="space-y-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-frost-white">Wallet Address to Revoke</label>
              <Input 
                placeholder="0x..." 
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="bg-white/5 border-white/10 text-frost-white"
              />
            </div>
            <p className="text-xs text-frost-white/50">
              Revoking will remove ALL roles for this address.
            </p>

            <Button 
              onClick={handleRevoke} 
              disabled={isPending || !targetAddress} 
              variant="destructive"
              className="w-full mt-4"
            >
              {isPending ? 'Processing...' : 'Revoke All Permissions'}
            </Button>
          </TabsContent>
        </Tabs>

        {isSuccess && (
          <div className="mt-4 p-3 bg-success-green/20 border border-success-green/30 rounded text-center text-success-green text-sm">
            Transaction Confirmed Successfully
          </div>
        )}
        
        {error && (
           <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-center text-red-400 text-sm">
            Error: {error.message}
          </div>
        )}

      </CardContent>
    </Card>
  )
}
