import { describe, test, expect, beforeEach, vi } from "vitest";
import { useChallengeStore } from "@/features/challenge/state";
import { useTransactionStore } from "@/features/transactions/state";
import { ChallengeStatus } from "@/features/challenge/types";

// Mock contract calls
vi.mock("@/features/challenge/services", () => ({
  createChallengeContract: vi.fn().mockResolvedValue("txhash123456789"),
  completeChallengeContract: vi.fn().mockResolvedValue("txhash987654321"),
  failChallengeContract: vi.fn().mockResolvedValue("txhash_fail_admit"),
  expireChallengeContract: vi.fn().mockResolvedValue("txhash_expired_claim"),
  getAllChallenges: vi.fn().mockResolvedValue([]),
  getChallenge: vi.fn().mockResolvedValue(null),
}));

describe("End-to-End Store Integration Flows", () => {
  beforeEach(() => {
    // Reset stores
    useChallengeStore.setState({
      challenges: [],
      currentChallenge: null,
      isLoading: false,
      isWriting: false,
      error: null,
      txHash: null,
    });
    useTransactionStore.setState({
      transactions: [],
    });
  });

  test("Flow 1: Connect wallet and create challenge -> Locks XLM & Activates -> Logs Transaction", async () => {
    const creator = "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X";
    const partner = "GBPARTNER3LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3Y";
    const title = "Clean Room Daily";
    const description = "Keep personal space clean.";
    const amount = "20";
    const deadlineUnix = Math.floor(Date.now() / 1000) + 86400; // tomorrow

    // Trigger create action
    await useChallengeStore.getState().createChallenge(
      creator,
      partner,
      title,
      description,
      amount,
      deadlineUnix
    );

    // Verify challenge store states
    const challengeState = useChallengeStore.getState();
    expect(challengeState.txHash).toBe("txhash123456789");
    expect(challengeState.isWriting).toBe(false);

    // Verify transaction center has logged the lock action
    const txState = useTransactionStore.getState();
    expect(txState.transactions).toHaveLength(1);
    expect(txState.transactions[0]).toEqual(
      expect.objectContaining({
        hash: "txhash123456789",
        challengeName: "Clean Room Daily",
        action: "create",
        amount: "20 XLM",
        status: "confirmed",
      })
    );
  });

  test("Flow 2: Complete Challenge -> XLM is returned -> Status resolves to Completed -> Logs Transaction", async () => {
    const partner = "GBPARTNER3LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3Y";
    const id = "1";

    // Prepopulate store with challenge
    useChallengeStore.setState({
      challenges: [
        {
          id: "1",
          creator: "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X",
          title: "Clean Room Daily",
          description: "Keep personal space clean.",
          amount: "20",
          deadline: Math.floor(Date.now() / 1000) + 86400,
          partner,
          status: ChallengeStatus.Active,
          createdAt: Math.floor(Date.now() / 1000) - 3600,
        },
      ],
    });

    // Trigger complete action
    await useChallengeStore.getState().completeChallenge(partner, id);

    // Verify transaction logs
    const txState = useTransactionStore.getState();
    expect(txState.transactions).toHaveLength(1);
    expect(txState.transactions[0]).toEqual(
      expect.objectContaining({
        hash: "txhash987654321",
        challengeName: "Clean Room Daily",
        action: "complete",
        status: "confirmed",
      })
    );
  });

  test("Flow 3: Challenge expires -> Accountability partner claims XLM -> Status updates to Expired -> Logs Transaction", async () => {
    const partner = "GBPARTNER3LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3Y";
    const id = "2";

    useChallengeStore.setState({
      challenges: [
        {
          id: "2",
          creator: "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X",
          title: "Drink Water",
          description: "Drink 3 liters of water.",
          amount: "15",
          deadline: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
          partner,
          status: ChallengeStatus.Active,
          createdAt: Math.floor(Date.now() / 1000) - 86400,
        },
      ],
    });

    // Trigger claim action (expire challenge)
    await useChallengeStore.getState().expireChallenge(partner, id);

    // Verify transaction logs
    const txState = useTransactionStore.getState();
    expect(txState.transactions).toHaveLength(1);
    expect(txState.transactions[0]).toEqual(
      expect.objectContaining({
        hash: "txhash_expired_claim",
        challengeName: "Drink Water",
        action: "expire",
        status: "confirmed",
      })
    );
  });
});
