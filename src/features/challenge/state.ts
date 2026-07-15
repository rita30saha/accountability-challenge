import { create } from "zustand";
import { Challenge } from "./types";
import { useTransactionStore } from "@/features/transactions/state";
import {
  getAllChallenges,
  getChallenge,
  createChallengeContract,
  completeChallengeContract,
  failChallengeContract,
  expireChallengeContract,
} from "./services";

interface ChallengeStore {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  isLoading: boolean;
  isWriting: boolean;
  error: string | null;
  txHash: string | null;

  fetchChallenges: () => Promise<void>;
  fetchChallengeById: (id: string) => Promise<void>;
  createChallenge: (
    creator: string,
    partner: string,
    title: string,
    description: string,
    amount: string,
    deadlineUnix: number
  ) => Promise<void>;
  completeChallenge: (partner: string, id: string) => Promise<void>;
  failChallenge: (caller: string, id: string) => Promise<void>;
  expireChallenge: (caller: string, id: string) => Promise<void>;
  clearTx: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  currentChallenge: null,
  isLoading: false,
  isWriting: false,
  error: null,
  txHash: null,

  fetchChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await getAllChallenges();
      set({ challenges: list, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load challenges", isLoading: false });
    }
  },

  fetchChallengeById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const challenge = await getChallenge(id);
      set({ currentChallenge: challenge, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load challenge details", isLoading: false });
    }
  },

  createChallenge: async (creator, partner, title, description, amount, deadlineUnix) => {
    set({ isWriting: true, error: null, txHash: null });
    try {
      const hash = await createChallengeContract(creator, partner, title, description, amount, deadlineUnix);
      
      useTransactionStore.getState().addTransaction({
        hash,
        challengeName: title,
        action: "create",
        amount: `${amount} XLM`,
        status: "confirmed",
      });

      set({ txHash: hash, isWriting: false });
      await get().fetchChallenges();
    } catch (err: any) {
      set({ error: err.message || "Failed to create challenge", isWriting: false });
      throw err;
    }
  },

  completeChallenge: async (partner, id) => {
    set({ isWriting: true, error: null, txHash: null });
    try {
      const hash = await completeChallengeContract(partner, id);
      const challenge = get().challenges.find((c) => c.id === id);

      useTransactionStore.getState().addTransaction({
        hash,
        challengeName: challenge?.title || `Challenge #${id}`,
        action: "complete",
        amount: challenge ? `${challenge.amount} XLM` : undefined,
        status: "confirmed",
      });

      set({ txHash: hash, isWriting: false });
      await get().fetchChallengeById(id);
      await get().fetchChallenges();
    } catch (err: any) {
      set({ error: err.message || "Failed to complete challenge", isWriting: false });
      throw err;
    }
  },

  failChallenge: async (caller, id) => {
    set({ isWriting: true, error: null, txHash: null });
    try {
      const hash = await failChallengeContract(caller, id);
      const challenge = get().challenges.find((c) => c.id === id);

      useTransactionStore.getState().addTransaction({
        hash,
        challengeName: challenge?.title || `Challenge #${id}`,
        action: "fail",
        amount: challenge ? `${challenge.amount} XLM` : undefined,
        status: "confirmed",
      });

      set({ txHash: hash, isWriting: false });
      await get().fetchChallengeById(id);
      await get().fetchChallenges();
    } catch (err: any) {
      set({ error: err.message || "Failed to fail challenge", isWriting: false });
      throw err;
    }
  },

  expireChallenge: async (caller, id) => {
    set({ isWriting: true, error: null, txHash: null });
    try {
      const hash = await expireChallengeContract(caller, id);
      const challenge = get().challenges.find((c) => c.id === id);

      useTransactionStore.getState().addTransaction({
        hash,
        challengeName: challenge?.title || `Challenge #${id}`,
        action: "expire",
        amount: challenge ? `${challenge.amount} XLM` : undefined,
        status: "confirmed",
      });

      set({ txHash: hash, isWriting: false });
      await get().fetchChallengeById(id);
      await get().fetchChallenges();
    } catch (err: any) {
      set({ error: err.message || "Failed to expire challenge", isWriting: false });
      throw err;
    }
  },

  clearTx: () => set({ txHash: null, error: null }),
}));
