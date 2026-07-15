import { useEffect, useState } from "react";
import { useWalletStore } from "./state";

export function useWallet() {
  const store = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    address: mounted ? store.address : null,
    walletType: mounted ? store.walletType : null,
    isConnected: mounted ? store.isConnected : false,
    isConnecting: store.isConnecting,
    error: store.error,
    connect: store.connect,
    disconnect: store.disconnect,
    clearError: store.clearError,
  };
}
