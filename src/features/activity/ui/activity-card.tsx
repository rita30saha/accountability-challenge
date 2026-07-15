import Link from "next/link";
import { Activity } from "../services";
import { StatusBadge } from "../../challenge/ui/status-badge";
import { Calendar, ExternalLink, ArrowRightLeft, CheckSquare, Plus, Lock, Unlock } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const formattedTime = new Date(activity.timestamp * 1000).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  let icon = <Plus className="h-5 w-5 text-neutral-400" />;
  let description = "";

  switch (activity.type) {
    case "created":
      icon = <Plus className="h-5 w-5 text-sky-400" />;
      description = `Challenge created and initialized.`;
      break;
    case "locked":
      icon = <Lock className="h-5 w-5 text-amber-500" />;
      description = `XLM staked and locked in escrow.`;
      break;
    case "active":
      icon = <ArrowRightLeft className="h-5 w-5 text-orange-500" />;
      description = `Challenge is now active and in progress.`;
      break;
    case "completed":
      icon = <CheckSquare className="h-5 w-5 text-emerald-500" />;
      description = `Goal completed and confirmed.`;
      break;
    case "failed":
      icon = <Unlock className="h-5 w-5 text-rose-500" />;
      description = `Goal failed. Escrow penalty initialized.`;
      break;
    case "released":
      icon = <Unlock className="h-5 w-5 text-emerald-400" />;
      description = `Escrow released and funds distributed.`;
      break;
  }

  const isSynthetic = activity.txHash === "Stellar Ledger Action";

  return (
    <div className="relative rounded-xl border border-white/5 bg-neutral-950/40 p-5 flex gap-4 transition-all hover:border-white/10 duration-200">
      {/* Icon Area */}
      <div className="rounded-lg bg-neutral-900 p-2.5 h-fit border border-white/5">
        {icon}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <Link
              href={`/challenge/${activity.challengeId}`}
              className="font-bold text-sm text-white hover:text-orange-400 hover:underline transition-colors block truncate"
            >
              {activity.challengeTitle}
            </Link>
            <p className="text-xs text-neutral-400">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedTime}
            </span>
            <StatusBadge status={activity.status} className="text-[10px]" />
          </div>
        </div>

        {/* Tx hash */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-neutral-500 border-t border-white/5">
          <span>ID: #{activity.challengeId}</span>
          {isSynthetic ? (
            <span>{activity.txHash}</span>
          ) : (
            <Link
              href={`https://stellar.expert/explorer/testnet/tx/${activity.txHash}`}
              target="_blank"
              className="hover:text-orange-400 transition-colors flex items-center gap-0.5"
            >
              Tx: {activity.txHash.slice(0, 8)}...{activity.txHash.slice(-8)}
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
