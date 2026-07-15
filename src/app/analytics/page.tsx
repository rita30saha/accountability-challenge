export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-neutral-400">View stats and historical success metrics of your challenges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Completion Rate</p>
          <p className="text-3xl font-semibold">0%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Success Rate</p>
          <p className="text-3xl font-semibold">0%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Total Staked Value</p>
          <p className="text-3xl font-semibold">0.00 XLM</p>
        </div>
      </div>

      {/* Analytics chart area placeholder */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/10 p-12 text-center text-neutral-500 text-sm">
        Chart visualizer will appear here in future phases.
      </div>
    </div>
  );
}
