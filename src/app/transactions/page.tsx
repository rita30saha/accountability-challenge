export default function TransactionCenterPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction Center</h1>
        <p className="text-neutral-400">View and track submission statuses of your goal transactions.</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-8 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-semibold text-lg text-white">No transactions submitted</h3>
          <p className="text-sm text-neutral-500">
            Submit a transaction (e.g. creating or resolving a challenge) to monitor progress.
          </p>
        </div>
      </div>
    </div>
  );
}
