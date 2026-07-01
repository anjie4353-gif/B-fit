"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sqlitePersistStorage } from "@/lib/storage/sqlite-persist";
import type {
  CrossFilterState,
  DashboardSection,
  ProgressFilters,
  SavedView,
} from "../types";
import { resolveDateRange } from "../utils/date-ranges";

const defaultFilters: ProgressFilters = {
  dateRange: resolveDateRange("last7"),
  categories: [],
  projects: [],
  taskTypes: [],
  users: [],
  teams: [],
};

interface ProgressDashboardStore {
  section: DashboardSection;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  filters: ProgressFilters;
  crossFilter: CrossFilterState;
  savedViews: SavedView[];
  tablePage: number;
  tablePageSize: number;
  tableSearch: string;
  tableSortKey: keyof import("../types").ProgressTaskRow | null;
  tableSortDir: "asc" | "desc";
  visibleColumns: string[];
  isLoading: boolean;
  error: string | null;
  setSection: (s: DashboardSection) => void;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setFilters: (f: Partial<ProgressFilters>) => void;
  resetFilters: () => void;
  setCrossFilter: (c: Partial<CrossFilterState>) => void;
  clearCrossFilter: () => void;
  saveView: (name: string) => void;
  loadView: (id: string) => void;
  deleteView: (id: string) => void;
  setTablePage: (p: number) => void;
  setTableSearch: (s: string) => void;
  setTableSort: (key: keyof import("../types").ProgressTaskRow) => void;
  toggleColumn: (col: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useProgressDashboardStore = create<ProgressDashboardStore>()(
  persist(
    (set, get) => ({
      section: "overview",
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      filters: defaultFilters,
      crossFilter: { selectedDate: null, selectedCategory: null, selectedKpi: null },
      savedViews: [],
      tablePage: 0,
      tablePageSize: 10,
      tableSearch: "",
      tableSortKey: "date",
      tableSortDir: "desc",
      visibleColumns: ["date", "label", "category", "completed", "completionRate"],
      isLoading: false,
      error: null,

      setSection: (section) => set({ section }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
      setFilters: (f) =>
        set((s) => ({ filters: { ...s.filters, ...f }, tablePage: 0 })),
      resetFilters: () =>
        set({
          filters: defaultFilters,
          crossFilter: { selectedDate: null, selectedCategory: null, selectedKpi: null },
          tablePage: 0,
        }),
      setCrossFilter: (c) =>
        set((s) => ({ crossFilter: { ...s.crossFilter, ...c }, tablePage: 0 })),
      clearCrossFilter: () =>
        set({
          crossFilter: { selectedDate: null, selectedCategory: null, selectedKpi: null },
        }),
      saveView: (name) => {
        const state = get();
        const view: SavedView = {
          id: crypto.randomUUID(),
          name,
          filters: state.filters,
          section: state.section,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedViews: [...s.savedViews, view] }));
      },
      loadView: (id) => {
        const view = get().savedViews.find((v) => v.id === id);
        if (view) set({ filters: view.filters, section: view.section });
      },
      deleteView: (id) =>
        set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),
      setTablePage: (tablePage) => set({ tablePage }),
      setTableSearch: (tableSearch) => set({ tableSearch, tablePage: 0 }),
      setTableSort: (key) =>
        set((s) => ({
          tableSortKey: key,
          tableSortDir:
            s.tableSortKey === key && s.tableSortDir === "asc" ? "desc" : "asc",
        })),
      toggleColumn: (col) =>
        set((s) => ({
          visibleColumns: s.visibleColumns.includes(col)
            ? s.visibleColumns.filter((c) => c !== col)
            : [...s.visibleColumns, col],
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "bfit-progress-dashboard",
      storage: createJSONStorage(() => sqlitePersistStorage),
      partialize: (s) => ({
        savedViews: s.savedViews,
        sidebarCollapsed: s.sidebarCollapsed,
        visibleColumns: s.visibleColumns,
      }),
    }
  )
);