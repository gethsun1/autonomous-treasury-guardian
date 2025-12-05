import { create } from 'zustand';

export interface AgentProposal {
  proposalId: string;
  actions: any[];
  reasoning: string;
  confidence: number;
  signature?: string;
}

interface AgentState {
  lastProposal: AgentProposal | null;
  isLoading: boolean;
  setLastProposal: (proposal: AgentProposal | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  lastProposal: null,
  isLoading: false,
  setLastProposal: (proposal) => set({ lastProposal: proposal }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

