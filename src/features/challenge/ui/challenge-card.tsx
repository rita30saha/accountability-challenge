import Link from "next/link";
import { Challenge } from "../types";
import { StatusBadge } from "./status-badge";
import { Calendar, Coins, ArrowUpRight } from "lucide-react";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const formattedDeadline = new Date(challenge.deadline * 1000).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const truncate = (addr: string) => `${addr.slice(0, 5)}...${addr.slice(-5)}`;

  return (
    <div className="group relative rounded-xl border border-white/5 bg-neutral-950/40 p-6 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <StatusBadge status={challenge.status} />
          <Link
            href={`/challenge/${challenge.id}`}
            className="text-neutral-400 group-hover:text-white transition-colors p-1"
          >
            <ArrowUpRight className="h-4.5 w-4.5" />
          </Link>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors line-clamp-1">
          {challenge.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-neutral-400 line-clamp-2">
          {challenge.description}
        </p>
      </div>

      {/* Metadata Footer */}
      <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Coins className="h-4 w-4 text-orange-500" />
          <span className="font-semibold text-white">{challenge.amount} XLM</span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400 justify-end">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span className="truncate">{formattedDeadline}</span>
        </div>

        <div className="col-span-2 text-[10px] text-neutral-500 font-mono flex justify-between">
          <span>Creator: {truncate(challenge.creator)}</span>
          <span>Partner: {truncate(challenge.partner)}</span>
        </div>
      </div>
    </div>
  );
}
