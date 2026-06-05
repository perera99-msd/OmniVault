import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  isAppLocked: boolean; // Not persisted across sessions, controlled by WebAuthn
  setAppLocked: (locked: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedWalletId: null,
      setSelectedWalletId: (id) => set({ selectedWalletId: id }),
      biometricEnabled: false,
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      isAppLocked: false,
      setAppLocked: (locked) => set({ isAppLocked: locked }),
    }),
    {
      name: "omnivault-storage",
      partialize: (state) => ({ 
        selectedWalletId: state.selectedWalletId, 
        biometricEnabled: state.biometricEnabled 
      }), // Only persist these fields
    }
  )
);
