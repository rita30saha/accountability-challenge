import { Challenge, ChallengeStatus } from "../types";
import { Coins, CheckCircle, Flame, ShieldAlert, Award } from "lucide-react";

interface DashboardSummaryProps {
  challenges: Challenge[];
}

export function DashboardSummary({ challenges }: DashboardSummaryProps) {
  const total = challenges.length;
  
  const active = challenges.filter(
    (c) => c.status === ChallengeStatus.Active
  ).length;

  const completed = challenges.filter(
    (c) => c.status === ChallengeStatus.Completed
  ).length;

  const failed = challenges.filter(
    (c) =>
      c.status === ChallengeStatus.Failed || c.status === ChallengeStatus.Expired
  ).length;

  const totalStaked = challenges
    .filter((c) => c.status === ChallengeStatus.Active)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
    .toFixed(2);

  const stats = [
    {
      name: "Total Challenges",
      value: total,
      icon: Award,
      color: "text-white",
      bg: "bg-white/5 border-white/5",
    },
    {
      name: "Active Stakes",
      value: active,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      name: "Completed Goals",
      value: completed,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Failed / Expired",
      value: failed,
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Total Active XLM Staked",
      value: `${totalStaked} XLM`,
      icon: Coins,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      colspan: "sm:col-span-2 lg:col-span-4",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`rounded-xl border p-6 flex items-center justify-between transition-all hover:scale-[1.01] ${stat.bg} ${stat.colspan || ""}`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {stat.name}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-black/40 ${stat.color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
