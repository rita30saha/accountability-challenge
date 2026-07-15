"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/features/wallet/hooks";
import { useSettingsStore } from "@/features/settings/state";
import { useChallengeStore } from "@/features/challenge/state";
import { useTransactionStore } from "@/features/transactions/state";
import { Loading } from "@/components/ui/loading";
import {
  ShieldAlert,
  Settings,
  Bell,
  SunMoon,
  Timer,
  Download,
  Trash2,
  Info,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const { isConnected, address, disconnect } = useWallet();
  const { challenges, fetchChallenges } = useChallengeStore();
  const { transactions, clearTransactions } = useTransactionStore();

  // Settings state
  const {
    refreshInterval,
    theme,
    notifications,
    setRefreshInterval,
    setTheme,
    setNotifications,
  } = useSettingsStore();

  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchChallenges();
    }
  }, [isConnected, fetchChallenges]);

  // Apply theme to HTML tag for preview
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="rounded-full bg-orange-500/10 p-4 text-orange-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
          <p className="text-sm text-neutral-400">
            Please connect your Stellar wallet using the button in the navigation bar to manage preferences and export history.
          </p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    // Compile JSON blob containing challenges and local transactions history
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      walletAddress: address,
      network: "testnet",
      appVersion: "v0.1.0-alpha",
      challenges: challenges.filter(
        (c) =>
          c.creator.toLowerCase() === address?.toLowerCase() ||
          c.partner.toLowerCase() === address?.toLowerCase()
      ),
      transactionHistory: transactions,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accountability_challenges_export_${Math.floor(Date.now() / 1000)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    // Clear Zustand storage and transaction centers
    clearTransactions();
    localStorage.removeItem("accountability-settings");
    setCacheCleared(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-neutral-400">
            Configure application variables, manage local cache, and export transactions audit logs.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Wallet Metadata & Action */}
        <div className="rounded-xl border border-white/10 bg-neutral-905/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Connected Session
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-mono select-none">Current Wallet Address</p>
              <p className="text-sm font-mono text-neutral-300 break-all select-all">{address}</p>
            </div>
            <button
              onClick={disconnect}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/50 px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors w-full sm:w-auto shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>

        {/* Application Configuration Preferences */}
        <div className="rounded-xl border border-white/10 bg-neutral-905/30 p-6 space-y-6">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Preferences Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theme Toggle option */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase flex items-center gap-1.5">
                <SunMoon className="h-3.5 w-3.5 text-orange-500" />
                Color Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            {/* Refresh Interval choice */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-orange-500" />
                Refresh Frequency
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value={5}>Every 5 seconds</option>
                <option value={10}>Every 10 seconds</option>
                <option value={30}>Every 30 seconds</option>
              </select>
            </div>

            {/* Notifications check */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-orange-500" />
                Alert Triggers
              </label>
              <label className="inline-flex items-center gap-2.5 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 w-full select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="rounded border-white/10 bg-neutral-900 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-white font-medium">Enable notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache actions */}
        <div className="rounded-xl border border-white/10 bg-neutral-905/30 p-6 space-y-6">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Diagnostics & Backups
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExport}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors"
            >
              <Download className="h-4 w-4 text-orange-500" />
              Export History (JSON)
            </button>

            <button
              onClick={handleClearCache}
              disabled={cacheCleared}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {cacheCleared ? "Clearing Storage..." : "Clear Cache & Reset"}
            </button>
          </div>

          {cacheCleared && (
            <div className="text-xs text-center text-orange-400 mt-2 animate-pulse">
              Storage initialized. Reloading application workspace...
            </div>
          )}
        </div>

        {/* About App Info */}
        <div className="rounded-xl border border-white/5 bg-neutral-950/20 p-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-neutral-500 shrink-0" />
          <div className="text-xs text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-300">Stellar Accountability challenge Manager</p>
            <p>Application Version: <span className="font-mono">v0.1.0-alpha (Stellar Orange Belt Level 3)</span></p>
            <p>Target Network: <span className="font-semibold text-orange-500">Stellar Testnet</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
