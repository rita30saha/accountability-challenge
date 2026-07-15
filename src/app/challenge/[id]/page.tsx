import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Users, Award } from "lucide-react";

export default async function ChallengeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Challenge #{id}</h1>
        <p className="text-neutral-400">Review status, dates, and submit resolution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/10 bg-neutral-900/20 p-6 space-y-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-orange-950/40 border border-orange-500/30 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                Active (Placeholder)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Example Challenge Title</h2>
            <p className="text-sm text-neutral-400">
              This is a description placeholder for Challenge #{id}.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-900/20 p-6 space-y-4">
            <h3 className="font-semibold text-white">Stellar Ledger Information</h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Escrow Balance</span>
                <span className="font-semibold text-white">50.00 XLM</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Transaction Hash</span>
                <span className="font-mono text-xs text-neutral-500">None</span>
              </div>
              <div className="flex justify-between">
                <span>Stellar Explorer</span>
                <span className="inline-flex items-center gap-1 text-orange-500">
                  Not Deployed
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel parameters */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-neutral-900/20 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                <Calendar className="h-4 w-4 text-orange-500" />
                Deadline
              </div>
              <p className="text-sm font-medium text-white">July 31, 2026</p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                <Users className="h-4 w-4 text-orange-500" />
                Partner Address
              </div>
              <p className="text-xs font-mono text-neutral-400 break-all">G...</p>
            </div>
          </div>

          {/* Resolutions Card */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/20 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
              <Award className="h-4 w-4 text-orange-500" />
              Actions
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-semibold text-white transition-colors opacity-50 cursor-not-allowed" disabled>
                Mark Completed
              </button>
              <button className="w-full rounded-lg bg-red-600 hover:bg-red-700 py-2 text-xs font-semibold text-white transition-colors opacity-50 cursor-not-allowed" disabled>
                Mark Failed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
