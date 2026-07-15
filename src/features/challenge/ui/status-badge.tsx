import { ChallengeStatus } from "../types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ChallengeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let label = "Unknown";
  let styles = "bg-neutral-900 border-neutral-800 text-neutral-400";

  switch (status) {
    case ChallengeStatus.Created:
      label = "Created";
      styles = "bg-neutral-900 border-neutral-800 text-neutral-400";
      break;
    case ChallengeStatus.Active:
      label = "Active";
      styles = "bg-orange-500/10 border-orange-500/30 text-orange-400";
      break;
    case ChallengeStatus.Completed:
      label = "Completed";
      styles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      break;
    case ChallengeStatus.Failed:
      label = "Failed";
      styles = "bg-rose-500/10 border-rose-500/30 text-rose-400";
      break;
    case ChallengeStatus.Expired:
      label = "Expired";
      styles = "bg-purple-500/10 border-purple-500/30 text-purple-400";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-200",
        styles,
        className
      )}
    >
      {label}
    </span>
  );
}
