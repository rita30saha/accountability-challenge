import Link from "next/link";
import { TrackedTransaction } from "../state";
import { TransactionStatusBadge } from "./status-badge";
import { ExternalLink, Calendar, PlusCircle, CheckCircle, HelpCircle, XCircle } from "lucide-react";

interface TransactionCardProps {
  transaction: TrackedTransaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const formattedTime = new Date(transaction.timestamp * 1000).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  let icon = <HelpCircle className="h-5 w-5 text-neutral-400" />;
  let actionLabel = "Unknown Action";

  switch (transaction.action) {
    case "create":
      icon = <PlusCircle className="h-5 w-5 text-sky-400" />;
      actionLabel = "Challenge Created";
      break;
    case "complete":
      icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
      actionLabel = "Challenge Completed";
      break;
    case "fail":
      icon = <XCircle className="h-5 w-5 text-rose-500" />;
      actionLabel = "Challenge Failed";
      break;
    case "expire":
      icon = <XCircle className="h-5 w-5 text-purple-400" />;
      actionLabel = "Challenge Expired";
      break;
  }

  return (
    <div className="relative rounded-xl border border-white/5 bg-neutral-950/40 p-5 flex gap-4 transition-all hover:border-white/10 duration-200">
      {/* Icon */}
      <div className="rounded-lg bg-neutral-900 p-2.5 h-fit border border-white/5">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-xs">
              {transaction.challengeName}
            </h4>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5 font-medium">
              <span>{actionLabel}</span>
              {transaction.amount && (
                <>
                  <span className="h-1 w-1 rounded-full bg-neutral-700" />
                  <span className="text-orange-500">{transaction.amount}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedTime}
            </span>
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>

        {/* XDR Hash Link */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-neutral-500 border-t border-white/5">
          <span>Stellar Testnet Transaction</span>
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${transaction.hash}`}
            target="_blank"
            className="hover:text-orange-400 transition-colors flex items-center gap-0.5"
          >
            Hash: {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-8)}
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>

        {transaction.error && (
          <p className="text-[10px] text-rose-400 mt-1 font-mono bg-rose-950/20 border border-rose-800/40 p-1.5 rounded">
            Error: {transaction.error}
          </p>
        )}
      </div>
    </div>
  );
}
