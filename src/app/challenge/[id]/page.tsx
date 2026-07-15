"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/features/wallet/hooks";
import { useChallengeStore } from "@/features/challenge/state";
import { StatusBadge } from "@/features/challenge/ui/status-badge";
import { ChallengeStatus } from "@/features/challenge/types";
import { Loading } from "@/components/ui/loading";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Users,
  Coins,
  ShieldAlert,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function ChallengeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isConnected, address } = useWallet();
  const {
    currentChallenge,
    isLoading,
    isWriting,
    error,
    txHash,
    fetchChallengeById,
    completeChallenge,
    failChallenge,
    expireChallenge,
    clearTx,
  } = useChallengeStore();

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchChallengeById(id);
    }
    return () => {
      clearTx();
    };
  }, [id, fetchChallengeById, clearTx]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to view challenge details.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !currentChallenge) {
    return <Loading message="Fetching goal details from Stellar..." />;
  }

  if (!currentChallenge) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Challenge Not Found</h2>
        <p className="text-neutral-400">Could not locate challenge #{id} on the ledger.</p>
        <Link href="/dashboard" className="text-orange-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCreator = currentChallenge.creator.toLowerCase() === address?.toLowerCase();
  const isPartner = currentChallenge.partner.toLowerCase() === address?.toLowerCase();

  const formattedDeadline = new Date(currentChallenge.deadline * 1000).toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const nowUnix = Math.floor(Date.now() / 1000);
  const isDeadlinePassed = nowUnix > currentChallenge.deadline;
  const isActive = currentChallenge.status === ChallengeStatus.Active;

  const handleComplete = async () => {
    try {
      setActionSuccess(null);
      await completeChallenge(address!, id);
      setActionSuccess("Challenge resolved as Completed. Stake returned to creator.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleFail = async () => {
    try {
      setActionSuccess(null);
      await failChallenge(address!, id);
      setActionSuccess("Challenge resolved as Failed. Stake transferred to partner.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaim = async () => {
    try {
      setActionSuccess(null);
      await expireChallenge(address!, id);
      setActionSuccess("Stake claimed successfully. Funds transferred to partner.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {currentChallenge.title}
            </h1>
            <p className="text-sm text-neutral-500 font-mono mt-1">Challenge ID: {id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={currentChallenge.status} className="text-sm py-1 px-3" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Core Description and Ledger Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/10 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
              Goal Description
            </h3>
            <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {currentChallenge.description}
            </p>
          </div>

          {/* Ledger Details */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/10 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
              Contract & Ledger Info
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Creator Wallet</span>
                <span className="font-mono text-neutral-300 break-all ml-4 text-right">
                  {currentChallenge.creator}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Partner Wallet</span>
                <span className="font-mono text-neutral-300 break-all ml-4 text-right">
                  {currentChallenge.partner}
                </span>
              </div>
              {txHash && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-400">Transaction Hash</span>
                  <span className="font-mono text-neutral-300 break-all ml-4 text-right select-all">
                    {txHash}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-neutral-400">Stellar Explorer</span>
                <Link
                  href={
                    txHash
                      ? `https://stellar.expert/explorer/testnet/tx/${txHash}`
                      : `https://stellar.expert/explorer/testnet/`
                  }
                  target="_blank"
                  className="inline-flex items-center gap-1 text-orange-500 hover:underline hover:text-orange-400"
                >
                  View on Stellar.expert
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Cards and Operations */}
        <div className="space-y-6">
          {/* Summary Panel */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/15 p-6 space-y-5">
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                <Coins className="h-4 w-4 text-orange-500" />
                Staked Escrow
              </span>
              <p className="text-3xl font-extrabold text-white">
                {currentChallenge.amount} <span className="text-sm font-medium text-neutral-400">XLM</span>
              </p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                <Calendar className="h-4 w-4 text-orange-500" />
                Completion Deadline
              </span>
              <p className="text-sm font-medium text-white">{formattedDeadline}</p>
              {isActive && (
                <p className="text-xs text-neutral-400 font-medium">
                  {isDeadlinePassed ? (
                    <span className="text-rose-400 font-semibold">Deadline Expired</span>
                  ) : (
                    <span>
                      Expires in:{" "}
                      {Math.ceil((currentChallenge.deadline - nowUnix) / 3600)} hours
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Action Operations */}
          {isActive && (
            <div className="rounded-xl border border-white/10 bg-neutral-900/15 p-6 space-y-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Resolution Panel
              </h3>

              {error && (
                <div className="text-xs text-rose-400 rounded bg-rose-950/20 border border-rose-800/40 p-2.5">
                  {error}
                </div>
              )}

              {isWriting ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  <span className="text-xs text-center">Awaiting signature & ledger confirmation...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Accountability Partner Actions */}
                  {isPartner && (
                    <>
                      {!isDeadlinePassed && (
                        <button
                          onClick={handleComplete}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                        >
                          Mark as Completed
                        </button>
                      )}
                      <button
                        onClick={handleFail}
                        className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                      >
                        {isDeadlinePassed ? "Claim Stake (Goal Failed)" : "Mark as Failed"}
                      </button>
                    </>
                  )}

                  {/* Creator Actions */}
                  {isCreator && (
                    <>
                      <button
                        onClick={handleFail}
                        className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                      >
                        Voluntarily Admit Failure
                      </button>
                      {isDeadlinePassed && (
                        <p className="text-xs text-neutral-500 text-center leading-relaxed">
                          Deadline has expired. Your partner can now claim the stake.
                        </p>
                      )}
                      {!isDeadlinePassed && (
                        <p className="text-xs text-neutral-500 text-center leading-relaxed">
                          Awaiting partner verification or deadline expiration.
                        </p>
                      )}
                    </>
                  )}

                  {/* Neither (Viewer) */}
                  {!isCreator && !isPartner && (
                    <div className="flex items-center gap-1.5 justify-center text-xs text-neutral-500 p-3 bg-neutral-950/20 rounded-lg">
                      <HelpCircle className="h-4 w-4" />
                      <span>Viewer Mode (Read-Only)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Success view */}
          {actionSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle className="h-4 w-4" />
                Resolution Complete
              </div>
              <p className="text-xs leading-relaxed">{actionSuccess}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
