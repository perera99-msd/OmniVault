import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  biometricCredentialId: string | null;
  setBiometricCredentialId: (id: string | null) => void;
  isAppLocked: boolean;
  setAppLocked: (locked: boolean) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedWalletId: null,
      setSelectedWalletId: (id) => set({ selectedWalletId: id }),
      biometricEnabled: false,
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      biometricCredentialId: null,
      setBiometricCredentialId: (id) => set({ biometricCredentialId: id }),
      isAppLocked: false,
      setAppLocked: (locked) => set({ isAppLocked: locked }),
      userAvatar: "sophia",
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),
    }),
    {
      name: "tria-vault-storage",
      partialize: (state) => ({ 
        selectedWalletId: state.selectedWalletId, 
        biometricEnabled: state.biometricEnabled,
        biometricCredentialId: state.biometricCredentialId,
        userAvatar: state.userAvatar,
      }),
    }
  )
);
