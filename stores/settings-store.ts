"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ThemePreference = "light" | "dark" | "system"

interface SettingsState {
  theme: ThemePreference
  generateKeyAutomatically: boolean
  defaultRails: number
  verifyBeforeDownload: true
  showSaveConfirmation: boolean
  maxImageSizeMb: number
  storeHistory: boolean
  clearTemporaryPreviews: boolean
  recoveryMetadata: boolean
  clearAfterDownloads: boolean
  update: (settings: Partial<Omit<SettingsState, "update" | "reset">>) => void
  reset: () => void
}

export const defaultSettings = {
  theme: "system" as const,
  generateKeyAutomatically: true,
  defaultRails: 3,
  verifyBeforeDownload: true as const,
  showSaveConfirmation: true,
  maxImageSizeMb: 20,
  storeHistory: true,
  clearTemporaryPreviews: true,
  recoveryMetadata: true,
  clearAfterDownloads: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      update: (settings) => set(settings),
      reset: () => set(defaultSettings),
    }),
    {
      name: "cipherpix-settings-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        generateKeyAutomatically: state.generateKeyAutomatically,
        defaultRails: state.defaultRails,
        verifyBeforeDownload: state.verifyBeforeDownload,
        showSaveConfirmation: state.showSaveConfirmation,
        maxImageSizeMb: state.maxImageSizeMb,
        storeHistory: state.storeHistory,
        clearTemporaryPreviews: state.clearTemporaryPreviews,
        recoveryMetadata: state.recoveryMetadata,
        clearAfterDownloads: state.clearAfterDownloads,
      }),
    }
  )
)
