"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/features/wallet/hooks";
import { useChallengeStore } from "@/features/challenge/state";
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function CreateChallengePage() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { createChallenge, isWriting, error, txHash, clearTx } = useChallengeStore();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [partner, setPartner] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to create a new challenge.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Basic validation
    if (!title.trim()) return setValidationError("Title is required.");
    if (!description.trim()) return setValidationError("Description is required.");
    if (!amount || parseFloat(amount) <= 0) {
      return setValidationError("Stake amount must be greater than 0 XLM.");
    }
    if (!deadline) return setValidationError("Completion deadline is required.");

    const deadlineUnix = Math.floor(new Date(deadline).getTime() / 1000);
    const nowUnix = Math.floor(Date.now() / 1000);
    if (deadlineUnix <= nowUnix) {
      return setValidationError("Deadline must be a future date and time.");
    }

    // 2. Validate partner address
    const cleanPartner = partner.trim();
    if (!cleanPartner) return setValidationError("Accountability partner address is required.");
    if (!/^[G][A-D,I-Z][2-7,A-Z]{54}$/.test(cleanPartner)) {
      return setValidationError("Partner address must be a valid Stellar public key (starts with G).");
    }

    if (cleanPartner.toLowerCase() === address?.toLowerCase()) {
      return setValidationError("You cannot set yourself as the accountability partner.");
    }

    try {
      await createChallenge(address!, cleanPartner, title, description, amount, deadlineUnix);
    } catch (err) {
      console.error("Create challenge failed", err);
    }
  };

  // Success view
  if (txHash) {
    return (
      <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border border-emerald-500/20 bg-neutral-950/40 text-center space-y-6 animate-in zoom-in duration-300">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Staked Successfully!</h2>
          <p className="text-sm text-neutral-400">
            Your challenge has been recorded on the Stellar ledger and funds are locked in escrow.
          </p>
        </div>

        <div className="rounded-lg bg-neutral-900 p-4 space-y-2 text-xs font-mono text-neutral-400 break-all border border-white/5">
          <p className="font-semibold text-neutral-500">Transaction Hash</p>
          <p className="select-all">{txHash}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            className="w-full rounded-lg border border-white/10 hover:bg-neutral-900 py-2.5 text-sm font-semibold text-neutral-300 transition-colors"
          >
            View on Stellar.expert
          </Link>
          <button
            onClick={() => {
              clearTx();
              router.push("/dashboard");
            }}
            className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Create Challenge
        </h1>
        <p className="text-sm text-neutral-400">
          State your commitment and lock XLM in escrow.
        </p>
      </div>

      <form className="space-y-6 rounded-xl border border-white/10 bg-neutral-900/20 p-6 sm:p-8" onSubmit={handleSubmit}>
        {/* Form Validation Error */}
        {(validationError || error) && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Submission Error</p>
              <p>{validationError || error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Challenge Title</label>
          <input
            type="text"
            required
            disabled={isWriting}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Code accountability app daily"
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Challenge Description</label>
          <textarea
            required
            disabled={isWriting}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline what needs to be accomplished to satisfy this challenge..."
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Stake Amount (XLM)</label>
            <input
              type="number"
              step="0.0000001"
              required
              disabled={isWriting}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50"
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Completion Deadline</label>
            <input
              type="datetime-local"
              required
              disabled={isWriting}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Accountability Partner Wallet Address</label>
          <input
            type="text"
            required
            disabled={isWriting}
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            placeholder="G..."
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isWriting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWriting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming Transaction in Wallet...
            </>
          ) : (
            "Create Challenge & Lock Stake"
          )}
        </button>
      </form>
    </div>
  );
}
