"use client";

import { useWallet } from "@/features/wallet/hooks";
import { LogOut, Globe, Cpu } from "lucide-react";

export default function SettingsPage() {
  const { address, isConnected, disconnect } = useWallet();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-neutral-400">Manage wallet configurations and application settings.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-900/20 p-6 space-y-6">
        <h3 className="font-semibold text-lg text-white border-b border-white/5 pb-3">Network & Connection</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              Stellar Network
            </span>
            <span className="font-semibold text-orange-500 uppercase">Testnet</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-500" />
              Soroban RPC Endpoint
            </span>
            <span className="font-mono text-xs text-neutral-500">https://soroban-testnet.stellar.org</span>
          </div>

          <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
            <span className="text-neutral-400">Wallet Status</span>
            <span>
              {isConnected ? (
                <span className="text-emerald-500 font-semibold">Connected</span>
              ) : (
                <span className="text-neutral-500">Disconnected</span>
              )}
            </span>
          </div>

          {isConnected && (
            <div className="space-y-2 border-t border-white/5 pt-4">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Connected Account Address</label>
              <div className="rounded bg-black p-3 font-mono text-xs text-neutral-300 break-all select-all border border-white/5">
                {address}
              </div>
              <button
                onClick={disconnect}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 px-4 py-2 text-sm text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
