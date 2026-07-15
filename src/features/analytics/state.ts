import { create } from "zustand";
import { Challenge, ChallengeStatus } from "../challenge/types";

export interface AnalyticsSummary {
  totalCreated: number;
  completedCount: number;
  failedCount: number;
  activeCount: number;
  completionRate: number;
  totalStaked: number;
  totalWon: number;
  totalLost: number;
}

interface AnalyticsStore {
  summary: AnalyticsSummary | null;
  calculateAnalytics: (challenges: Challenge[], address: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  summary: null,
  calculateAnalytics: (challenges, address) => {
    const userChallenges = challenges.filter(
      (c) =>
        c.creator.toLowerCase() === address.toLowerCase() ||
        c.partner.toLowerCase() === address.toLowerCase()
    );

    const totalCreated = userChallenges.length;
    const completedCount = userChallenges.filter((c) => c.status === ChallengeStatus.Completed).length;
    const failedCount = userChallenges.filter(
      (c) => c.status === ChallengeStatus.Failed || c.status === ChallengeStatus.Expired
    ).length;
    const activeCount = userChallenges.filter((c) => c.status === ChallengeStatus.Active).length;

    // Completion Rate: Completed / (Completed + Failed/Expired)
    const totalResolved = completedCount + failedCount;
    const completionRate = totalResolved > 0 ? (completedCount / totalResolved) * 100 : 0;

    let totalStaked = 0;
    let totalWon = 0;
    let totalLost = 0;

    for (const c of userChallenges) {
      const amt = parseFloat(c.amount) || 0;
      totalStaked += amt;

      const isCreator = c.creator.toLowerCase() === address.toLowerCase();
      const isPartner = c.partner.toLowerCase() === address.toLowerCase();

      if (c.status === ChallengeStatus.Completed) {
        if (isCreator) {
          totalWon += amt;
        }
      } else if (c.status === ChallengeStatus.Failed || c.status === ChallengeStatus.Expired) {
        if (isCreator) {
          totalLost += amt;
        } else if (isPartner) {
          totalWon += amt;
        }
      }
    }

    set({
      summary: {
        totalCreated,
        completedCount,
        failedCount,
        activeCount,
        completionRate,
        totalStaked,
        totalWon,
        totalLost,
      },
    });
  },
}));
