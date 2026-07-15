import { TrackedTransaction } from "../state";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: TrackedTransaction["status"];
  className?: string;
}

export function TransactionStatusBadge({ status, className }: StatusBadgeProps) {
  let label = "Unknown";
  let styles = "bg-neutral-900 border-neutral-800 text-neutral-400";
  let icon = <AlertCircle className="h-3 w-3" />;

  switch (status) {
    case "pending":
      label = "Pending";
      styles = "bg-neutral-900 border-neutral-850 text-neutral-400";
      icon = <AlertCircle className="h-3 w-3" />;
      break;
    case "processing":
      label = "Processing";
      styles = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      icon = <Loader2 className="h-3 w-3 animate-spin" />;
      break;
    case "confirmed":
      label = "Confirmed";
      styles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      icon = <CheckCircle2 className="h-3 w-3" />;
      break;
    case "failed":
      label = "Failed";
      styles = "bg-rose-500/10 border-rose-500/30 text-rose-400";
      icon = <XCircle className="h-3 w-3" />;
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-205",
        styles,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
