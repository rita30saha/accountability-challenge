"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/features/wallet/hooks";
import { useChallengeStore } from "@/features/challenge/state";
import { useActivityStore } from "@/features/activity/state";
import { ActivityCard } from "@/features/activity/ui/activity-card";
import { Loading } from "@/components/ui/loading";
import { ShieldAlert, Radio, Search } from "lucide-react";

export default function ActivityFeedPage() {
  const { isConnected } = useWallet();
  const { challenges, fetchChallenges } = useChallengeStore();
  const { activities, isLoading, error, fetchActivities } = useActivityStore();

  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Polling loop: every 5 seconds
  useEffect(() => {
    if (!isConnected) return;

    const poll = async () => {
      await fetchChallenges();
      // Use the challenges updated in the store
      const latestChallenges = useChallengeStore.getState().challenges;
      await fetchActivities(latestChallenges);
    };

    poll(); // Initial fetch

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [isConnected, fetchChallenges, fetchActivities]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to view the contract activity logs.
          </p>
        </div>
      </div>
    );
  }

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    // 1. Filter by status type
    if (filter !== "all" && act.type !== filter) return false;
    // 2. Filter by search query
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      return (
        act.challengeTitle.toLowerCase().includes(query) ||
        act.challengeId.includes(query)
      );
    }
    return true;
  });

  const filterButtons = [
    { label: "All Events", value: "all" },
    { label: "Created", value: "created" },
    { label: "Staked", value: "locked" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Activity Feed
          </h1>
          <p className="text-sm text-neutral-400">
            Real-time ledger events and operations audit timeline.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/5 px-3 py-1.5 text-xs text-orange-400 font-semibold w-fit animate-pulse">
          <Radio className="h-3.5 w-3.5" />
          Live Listening (5s Polling)
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                filter === btn.value
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-white/10 bg-neutral-900/40 text-neutral-400 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-neutral-950/40 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          Error syncing feed: {error}
        </div>
      )}

      {/* Event Timeline List */}
      {isLoading && activities.length === 0 ? (
        <Loading message="Syncing event logs from the blockchain..." />
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-neutral-950/30 p-12 text-center text-neutral-500 text-sm">
          No matching activities found.
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
