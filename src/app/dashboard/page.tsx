"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/features/wallet/hooks";
import { useChallengeStore } from "@/features/challenge/state";
import { DashboardSummary } from "@/features/challenge/ui/dashboard-summary";
import { ChallengeCard } from "@/features/challenge/ui/challenge-card";
import { Loading } from "@/components/ui/loading";
import { ArrowRight, ShieldAlert, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { isConnected, address } = useWallet();
  const { challenges, isLoading, error, fetchChallenges } = useChallengeStore();

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to view your dashboard and goals.
          </p>
        </div>
      </div>
    );
  }

  // Filter challenges where the user is either the creator or the accountability partner
  const userChallenges = challenges.filter(
    (c) =>
      c.creator.toLowerCase() === address?.toLowerCase() ||
      c.partner.toLowerCase() === address?.toLowerCase()
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-400">
            Connected Account: <span className="font-mono text-neutral-300 select-all">{address}</span>
          </p>
        </div>

        <div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="h-4 w-4" />
            New Challenge
          </Link>
        </div>
      </div>

      {/* Stats Summary Panel */}
      {isLoading && challenges.length === 0 ? (
        <Loading message="Loading dashboard statistics..." />
      ) : (
        <DashboardSummary challenges={userChallenges} />
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Your Challenges</h2>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
            Error loading challenges from contract: {error}
          </div>
        )}

        {isLoading ? (
          <Loading message="Fetching goals from ledger..." />
        ) : userChallenges.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-neutral-950/30 p-12 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-semibold text-lg text-white">No active challenges found</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                You are not registered as a creator or partner on any goals yet. Start by locking your first goal in escrow!
              </p>
              <div className="pt-4">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 hover:underline"
                >
                  Create your first challenge
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
