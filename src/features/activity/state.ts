import { create } from "zustand";
import { Activity, fetchRealEvents, generateSyntheticActivities } from "./services";
import { Challenge } from "../challenge/types";

interface ActivityStore {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: (challenges: Challenge[]) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async (challenges: Challenge[]) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch real ledger events
      const realEvents = await fetchRealEvents();
      
      // 2. Generate fallback events from challenge states
      const syntheticEvents = generateSyntheticActivities(challenges);

      // Merge and remove duplicate event registrations (by challengeId and event type)
      // Real events take precedence
      const merged = [...realEvents];
      
      for (const syn of syntheticEvents) {
        const duplicate = merged.find(
          (real) =>
            real.challengeId === syn.challengeId &&
            real.type === syn.type
        );
        if (!duplicate) {
          merged.push(syn);
        }
      }

      // Sort by timestamp descending
      const sorted = merged.sort((a, b) => b.timestamp - a.timestamp);

      set({ activities: sorted, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to load activity log",
        isLoading: false,
      });
    }
  },
}));
