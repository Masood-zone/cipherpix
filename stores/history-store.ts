"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { ActivityRecord } from "@/lib/cipherpix/types"

interface HistoryState {
  records: ActivityRecord[]
  add: (record: ActivityRecord) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      add: (record) => set((state) => ({ records: [record, ...state.records].slice(0, 100) })),
      clear: () => set({ records: [] }),
    }),
    { name: "cipherpix-history-v1", storage: createJSONStorage(() => localStorage) },
  ),
)
