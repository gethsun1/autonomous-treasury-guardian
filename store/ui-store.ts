import { create } from 'zustand';

interface UiState {
  isApprovalMode: boolean;
  setApprovalMode: (mode: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isApprovalMode: false, // Default to Auto Mode for now, can be persisted
  setApprovalMode: (mode) => set({ isApprovalMode: mode }),
}));

