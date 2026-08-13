import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface AppState {
  sidebarOpen: boolean;
  summaryPanelOpen: boolean;
  theme: ThemePreference;
  activeThreadId: string;
  expandedProjectIds: string[];
  recentFiles: string[];
  toggleSidebar(): void;
  toggleSummaryPanel(): void;
  setTheme(theme: ThemePreference): void;
  selectThread(threadId: string): void;
  toggleProject(projectId: string): void;
  addRecentFile(path: string): void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      summaryPanelOpen: false,
      theme: "system",
      activeThreadId: "workspace-navigation",
      expandedProjectIds: ["pi-ui", "pi-core"],
      recentFiles: [],
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSummaryPanel: () => set((state) => ({ summaryPanelOpen: !state.summaryPanelOpen })),
      setTheme: (theme) => set({ theme }),
      selectThread: (activeThreadId) => set({ activeThreadId }),
      toggleProject: (projectId) =>
        set((state) => ({
          expandedProjectIds: state.expandedProjectIds.includes(projectId)
            ? state.expandedProjectIds.filter((id) => id !== projectId)
            : [...state.expandedProjectIds, projectId]
        })),
      addRecentFile: (path) =>
        set((state) => ({ recentFiles: [path, ...state.recentFiles.filter((item) => item !== path)].slice(0, 8) }))
    }),
    { name: "pi-app-state" }
  )
);
