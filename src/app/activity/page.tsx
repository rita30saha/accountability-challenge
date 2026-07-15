import { Radio } from "lucide-react";

export default function ActivityFeedPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-neutral-400">Real-time contract events from the Stellar blockchain.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-950/20 px-3 py-1.5 text-xs text-orange-400 font-semibold animate-pulse">
          <Radio className="h-4.5 w-4.5" />
          Live Listening (Idle)
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-8 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-semibold text-lg text-white">No activities recorded</h3>
          <p className="text-sm text-neutral-500">
            Wait for challenges to be created, locked, or completed to view events.
          </p>
        </div>
      </div>
    </div>
  );
}
