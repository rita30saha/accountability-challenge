import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WalletState, WalletActions } from "./types";
import { walletService, WalletType } from "./services";

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      address: null,
      walletType: null,
      isConnected: false,
      isConnecting: false,
      error: null,

      connect: async (type: WalletType) => {
        set({ isConnecting: true, error: null });
        try {
          const address = await walletService.connect(type);
          set({
            address,
            walletType: type,
            isConnected: true,
            isConnecting: false,
          });
        } catch (err: any) {
          set({
            error: err.message || "Failed to connect wallet",
            isConnecting: false,
            isConnected: false,
            address: null,
            walletType: null,
          });
          throw err;
        }
      },

      disconnect: () => {
        set({
          address: null,
          walletType: null,
          isConnected: false,
          isConnecting: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "stellar-wallet-connection",
      partialize: (state) => ({
        address: state.address,
        walletType: state.walletType,
        isConnected: state.isConnected,
      }),
    }
  )
);
