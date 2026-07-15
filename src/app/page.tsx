"use client";

import Link from "next/link";
import { useWallet } from "@/features/wallet/hooks";
import { FREIGHTER_ID, ALBEDO_ID, XBULL_ID } from "@/features/wallet/services";
import { useState } from "react";
import { ArrowRight, Flame, ShieldCheck, Coins } from "lucide-react";

export default function LandingPage() {
  const { isConnected, isConnecting, connect } = useWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-orange-600/10 blur-[80px] -z-10" />

      {/* Hero Content */}
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/20 px-3 py-1 text-sm font-medium text-orange-400">
          <Flame className="h-4 w-4" />
          Decentralized Commitment Escrow
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
          Accountability Challenge
        </h1>

        <p className="text-lg sm:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Keep yourself honest by locking XLM into smart-contract escrow for your personal goals. Succeed and get your stake back; fail and it goes to your accountability partner.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isConnected ? (
            <Link
              href="/create"
              className="group flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create a Challenge
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div className="flex flex-col gap-2 relative">
              <button
                onClick={() => setShowWalletOptions(!showWalletOptions)}
                disabled={isConnecting}
                className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {showWalletOptions && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-48 rounded-xl border border-white/10 bg-neutral-950 p-2 shadow-2xl flex flex-col gap-1">
                  <button
                    onClick={() => {
                      connect(FREIGHTER_ID);
                      setShowWalletOptions(false);
                    }}
                    className="w-full text-left rounded px-3 py-2 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    Freighter Wallet
                  </button>
                  <button
                    onClick={() => {
                      connect(ALBEDO_ID);
                      setShowWalletOptions(false);
                    }}
                    className="w-full text-left rounded px-3 py-2 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    Albedo Wallet
                  </button>
                  <button
                    onClick={() => {
                      connect(XBULL_ID);
                      setShowWalletOptions(false);
                    }}
                    className="w-full text-left rounded px-3 py-2 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    xBull Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/50 hover:bg-neutral-900 px-6 py-3 font-semibold text-neutral-300 hover:text-white transition-all"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
            <Coins className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">Staked Escrow</h3>
          <p className="text-sm text-neutral-500 text-center">
            Your tokens are locked in a secure decentralized escrow contract on Stellar.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">Peer Verified</h3>
          <p className="text-sm text-neutral-500 text-center">
            Your accountability partner holds the key to confirming challenge success or failure.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-6 flex flex-col items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
            <Flame className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">Commitment Incentives</h3>
          <p className="text-sm text-neutral-500 text-center">
            Financially back your habits to drive consistent action and higher success rates.
          </p>
        </div>
      </div>
    </div>
  );
}
