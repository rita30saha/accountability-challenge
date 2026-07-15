import { describe, test, expect, beforeEach } from "vitest";
import { useWalletStore } from "@/features/wallet/state";

describe("Wallet State Store", () => {
  beforeEach(() => {
    // Reset state before each test
    useWalletStore.setState({
      address: null,
      walletType: null,
      isConnected: false,
      isHydrated: true,
    });
  });

  test("should initialize with default disconnected state", () => {
    const state = useWalletStore.getState();
    expect(state.address).toBeNull();
    expect(state.walletType).toBeNull();
    expect(state.isConnected).toBe(false);
  });

  test("should update state on successful connect", async () => {
    const mockAddress = "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X";
    await useWalletStore.getState().connect("freighter");

    const state = useWalletStore.getState();
    expect(state.address).toBe(mockAddress);
    expect(state.walletType).toBe("freighter");
    expect(state.isConnected).toBe(true);
  });

  test("should reset state on disconnect", async () => {
    await useWalletStore.getState().connect("freighter");
    
    // Disconnect
    useWalletStore.getState().disconnect();

    const state = useWalletStore.getState();
    expect(state.address).toBeNull();
    expect(state.walletType).toBeNull();
    expect(state.isConnected).toBe(false);
  });
});
