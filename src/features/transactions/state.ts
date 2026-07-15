import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TrackedTransaction {
  hash: string;
  status: "pending" | "processing" | "confirmed" | "failed";
  challengeName: string;
  action: "create" | "complete" | "fail" | "expire";
  timestamp: number;
  amount?: string;
  error?: string | null;
}

interface TransactionStore {
  transactions: TrackedTransaction[];
  addTransaction: (tx: Omit<TrackedTransaction, "timestamp" | "status"> & { status?: TrackedTransaction["status"] }) => void;
  updateTransactionStatus: (
    hash: string,
    status: TrackedTransaction["status"],
    error?: string | null
  ) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (tx) => {
        const newTx: TrackedTransaction = {
          ...tx,
          status: tx.status || "processing",
          timestamp: Math.floor(Date.now() / 1000),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions].slice(0, 100), // Cap at last 100 txs
        }));
      },

      updateTransactionStatus: (hash, status, error = null) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, status, error } : tx
          ),
        }));
      },

      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: "stellar-transaction-history",
    }
  )
);
