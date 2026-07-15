"use client";

import { useEffect } from "react";
import { useWallet } from "@/features/wallet/hooks";
import { useChallengeStore } from "@/features/challenge/state";
import { useAnalyticsStore } from "@/features/analytics/state";
import { Loading } from "@/components/ui/loading";
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  Percent,
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Wallet,
} from "lucide-react";

export default function AnalyticsPage() {
  const { isConnected, address } = useWallet();
  const { challenges, isLoading, fetchChallenges } = useChallengeStore();
  const { summary, calculateAnalytics } = useAnalyticsStore();

  useEffect(() => {
    if (isConnected) {
      fetchChallenges();
    }
  }, [isConnected, fetchChallenges]);

  useEffect(() => {
    if (isConnected && address && challenges.length >= 0) {
      calculateAnalytics(challenges, address);
    }
  }, [isConnected, address, challenges, calculateAnalytics]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to view your goal statistics and financial metrics.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !summary) {
    return <Loading message="Calculating performance and escrow metrics..." />;
  }

  const s = summary || {
    totalCreated: 0,
    completedCount: 0,
    failedCount: 0,
    activeCount: 0,
    completionRate: 0,
    totalStaked: 0,
    totalWon: 0,
    totalLost: 0,
  };

  const metricCards = [
    {
      name: "Total Created",
      value: s.totalCreated,
      icon: Award,
      color: "text-white",
      bg: "bg-white/5 border-white/5",
    },
    {
      name: "Completed Goals",
      value: s.completedCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Failed & Expired",
      value: s.failedCount,
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Success Percentage",
      value: `${s.completionRate.toFixed(0)}%`,
      icon: Percent,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      name: "Cumulative Staked",
      value: `${s.totalStaked.toFixed(2)} XLM`,
      icon: Coins,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      name: "Total XLM Won",
      value: `${s.totalWon.toFixed(2)} XLM`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Total XLM Lost",
      value: `${s.totalLost.toFixed(2)} XLM`,
      icon: TrendingDown,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Active Contracts",
      value: s.activeCount,
      icon: Activity,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-sm text-neutral-400">
          Historical overview of commitment outcomes, return rates, and locked balances.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`rounded-xl border p-6 flex items-center justify-between transition-all hover:scale-[1.01] ${card.bg}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {card.name}
                </p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-black/40 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Wallet metadata */}
        <div className="rounded-xl border border-white/10 bg-neutral-900/10 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Wallet className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-white">Wallet Connection</h3>
          </div>
          <div className="space-y-2 text-xs">
            <span className="text-neutral-500 block uppercase font-semibold">Stellar Public Key</span>
            <div className="rounded bg-black p-3 font-mono text-neutral-300 break-all select-all border border-white/5">
              {address}
            </div>
          </div>
        </div>

        {/* Network metadata */}
        <div className="rounded-xl border border-white/10 bg-neutral-900/10 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Globe className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-white">Blockchain Metadata</h3>
          </div>
          <div className="space-y-3 text-sm text-neutral-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Stellar Network</span>
              <span className="font-semibold text-white uppercase">Testnet</span>
            </div>
            <div className="flex justify-between">
              <span>RPC Node URL</span>
              <span className="font-mono text-xs text-neutral-300">
                https://soroban-testnet.stellar.org
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
