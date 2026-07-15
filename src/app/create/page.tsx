"use client";

export default function CreateChallengePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Challenge</h1>
        <p className="text-neutral-400">Lock XLM on a personal commitment and name your partner.</p>
      </div>

      <form className="space-y-6 rounded-xl border border-white/10 bg-neutral-900/20 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Challenge Title</label>
          <input
            type="text"
            placeholder="e.g., Study Soroban every day"
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
            disabled
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Challenge Description</label>
          <textarea
            placeholder="Describe what success looks like..."
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
            disabled
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Stake Amount (XLM)</label>
            <input
              type="number"
              placeholder="e.g., 50"
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Completion Deadline</label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300">Accountability Partner Address</label>
          <input
            type="text"
            placeholder="G..."
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 text-sm text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
            disabled
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-3 text-sm font-semibold text-white transition-all opacity-50 cursor-not-allowed"
          disabled
        >
          Create Challenge (Placeholder)
        </button>
      </form>
    </div>
  );
}
