import { useWatchContractEvent } from 'wagmi';
import { contracts } from '@/lib/contracts';
import { useState } from 'react';

export interface AiEvent {
  type: 'ActionProposed' | 'ActionExecuted' | 'PaymentExecuted' | 'Deposited' | 'Withdrawn' | 'ParametersUpdated' | 'RoleAssigned' | 'RoleRevoked';
  txHash: string;
  blockNumber: bigint;
  
  // Common/Shared
  timestamp?: bigint; // Some events emit timestamp, others don't
  amount?: bigint;
  token?: string;
  
  // ActionExecutor
  id?: string;
  agent?: string;
  actionType?: string;
  tokenFrom?: string;
  tokenTo?: string;
  reason?: string;
  recipient?: string;
  initiatedBy?: string;

  // TreasuryVault
  from?: string;
  to?: string;

  // RiskParameters
  maxRebalanceBps?: bigint;
  volatilityThresholdBps?: bigint;
  minRunwayMonths?: bigint;

  // PermissionManager
  who?: string;
  role?: number;
}

export function useAiEvents() {
  const [events, setEvents] = useState<AiEvent[]>([]);

  const addEvents = (newEvents: AiEvent[]) => {
    setEvents(prev => {
      // Filter duplicates based on txHash + logIndex (simplified to txHash + type here)
      const unique = newEvents.filter(ne => 
        !prev.some(pe => pe.txHash === ne.txHash && pe.type === ne.type)
      );
      return [...unique, ...prev].sort((a, b) => {
          // Sort by block number descending (approximating time)
          return Number(b.blockNumber - a.blockNumber);
      });
    });
  };

  // ActionExecutor: ActionProposed
  useWatchContractEvent({
    address: contracts.actionExecutor.address,
    abi: contracts.actionExecutor.abi,
    eventName: 'ActionProposed',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'ActionProposed',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          id: args.id,
          agent: args.agent,
          actionType: args.actionType,
          tokenFrom: args.tokenFrom,
          tokenTo: args.tokenTo,
          amount: args.amount,
          reason: args.reason,
          timestamp: args.timestamp,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // ActionExecutor: ActionExecuted
  useWatchContractEvent({
    address: contracts.actionExecutor.address,
    abi: contracts.actionExecutor.abi,
    eventName: 'ActionExecuted',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'ActionExecuted',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          id: args.id,
          agent: args.agent,
          actionType: args.actionType,
          tokenFrom: args.tokenFrom,
          tokenTo: args.tokenTo,
          amount: args.amount,
          timestamp: args.timestamp,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // ActionExecutor: PaymentExecuted
  useWatchContractEvent({
    address: contracts.actionExecutor.address,
    abi: contracts.actionExecutor.abi,
    eventName: 'PaymentExecuted',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'PaymentExecuted',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          token: args.token,
          recipient: args.recipient,
          amount: args.amount,
          initiatedBy: args.initiatedBy,
          timestamp: args.timestamp,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // TreasuryVault: Deposited
  useWatchContractEvent({
    address: contracts.treasuryVault.address,
    abi: contracts.treasuryVault.abi,
    eventName: 'Deposited',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'Deposited',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          token: args.token,
          from: args.from,
          amount: args.amount,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // TreasuryVault: Withdrawn
  useWatchContractEvent({
    address: contracts.treasuryVault.address,
    abi: contracts.treasuryVault.abi,
    eventName: 'Withdrawn',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'Withdrawn',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          token: args.token,
          to: args.to,
          amount: args.amount,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // RiskParameters: ParametersUpdated
  useWatchContractEvent({
    address: contracts.riskParameters.address,
    abi: contracts.riskParameters.abi,
    eventName: 'ParametersUpdated',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'ParametersUpdated',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          maxRebalanceBps: args.maxRebalanceBps,
          volatilityThresholdBps: args.volatilityThresholdBps,
          minRunwayMonths: args.minRunwayMonths,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // PermissionManager: RoleAssigned
  useWatchContractEvent({
    address: contracts.permissionManager.address,
    abi: contracts.permissionManager.abi,
    eventName: 'RoleAssigned',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'RoleAssigned',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          who: args.who,
          role: args.role,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  // PermissionManager: RoleRevoked
  useWatchContractEvent({
    address: contracts.permissionManager.address,
    abi: contracts.permissionManager.abi,
    eventName: 'RoleRevoked',
    onLogs(logs) {
      const newEvents = logs.map(log => {
        const args = (log as any).args;
        return {
          type: 'RoleRevoked',
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          who: args.who,
        } as AiEvent;
      });
      addEvents(newEvents);
    },
  });

  return { events };
}
