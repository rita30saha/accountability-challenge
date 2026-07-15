export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400">Track and manage your locked accountability stakes.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Total Challenges</p>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Active Challenges</p>
          <p className="text-3xl font-semibold text-orange-500">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Completed Challenges</p>
          <p className="text-3xl font-semibold text-emerald-500">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Total Staked</p>
          <p className="text-3xl font-semibold">0.00 XLM</p>
        </div>
      </div>

      {/* Challenges List Placeholder */}
      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-8 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-semibold text-lg text-white">No active challenges</h3>
          <p className="text-sm text-neutral-500">
            You don't have any challenges active at the moment. Create a challenge and back it with XLM.
          </p>
        </div>
      </div>
    </div>
  );
}
