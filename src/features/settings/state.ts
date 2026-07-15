import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  refreshInterval: number; // in seconds: 5, 10, or 30
  theme: "light" | "dark" | "system";
  notifications: boolean;
  setRefreshInterval: (val: number) => void;
  setTheme: (val: "light" | "dark" | "system") => void;
  setNotifications: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      refreshInterval: 5,
      theme: "dark",
      notifications: true,

      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: "accountability-settings",
    }
  )
);
