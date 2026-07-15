"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/features/wallet/hooks";
import { WalletType, FREIGHTER_ID, ALBEDO_ID, XBULL_ID } from "@/features/wallet/services";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Wallet, LogOut, ChevronDown } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, error, connect, disconnect, clearError } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Create Challenge", href: "/create" },
    { name: "Activity Feed", href: "/activity" },
    { name: "Analytics", href: "/analytics" },
    { name: "Settings", href: "/settings" },
  ];

  const handleConnect = async (type: WalletType) => {
    try {
      await connect(type);
      setShowWalletMenu(false);
    } catch (e) {
      console.error("Connection failed", e);
    }
  };

  const truncatedAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-500" />
          <Link href="/" className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Accountability
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-500",
                  isActive ? "text-orange-500 font-semibold" : "text-neutral-400"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Wallet controls */}
        <div className="relative">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {truncatedAddress}
              </div>
              <button
                onClick={disconnect}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-sm text-neutral-400 hover:text-white border border-white/5 transition-all"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                disabled={isConnecting}
                className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-white/10 bg-neutral-950 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="px-2 py-1.5 text-xs font-semibold text-neutral-500">
                    Select a Wallet
                  </p>
                  <button
                    onClick={() => handleConnect(FREIGHTER_ID)}
                    className="w-full text-left rounded px-2 py-1.5 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    Freighter
                  </button>
                  <button
                    onClick={() => handleConnect(ALBEDO_ID)}
                    className="w-full text-left rounded px-2 py-1.5 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    Albedo
                  </button>
                  <button
                    onClick={() => handleConnect(XBULL_ID)}
                    className="w-full text-left rounded px-2 py-1.5 text-sm hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    xBull
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-lg bg-red-950/80 border border-red-800/40 p-3 text-xs text-red-300 shadow-xl flex flex-col gap-2">
              <div className="font-semibold">Wallet Error</div>
              <div>{error}</div>
              <button
                onClick={clearError}
                className="self-end underline font-medium hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
