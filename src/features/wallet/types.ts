import { WalletType } from "./services";

export interface WalletState {
  address: string | null;
  walletType: WalletType | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletActions {
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export type NetworkType = "testnet" | "public" | "futurenet";
