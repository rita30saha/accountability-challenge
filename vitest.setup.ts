import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  useParams() {
    return { id: "1" };
  },
}));

// Mock window matchMedia for theme preferences check
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Stellar-Wallets-Kit SDK classes and constants to avoid JSDOM loading errors
vi.mock("@creit.tech/stellar-wallets-kit", () => {
  return {
    StellarWalletsKit: class {
      setWallet = vi.fn();
      getAddress = vi.fn().mockResolvedValue({ address: "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X" });
      signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "mockSignedXdr" });
    },
    WalletNetwork: {
      TESTNET: "testnet",
      PUBLIC: "public",
    },
    FreighterModule: class {},
    AlbedoModule: class {},
    xBullModule: class {},
    FREIGHTER_ID: "freighter",
    ALBEDO_ID: "albedo",
    XBULL_ID: "xbull",
  };
});
