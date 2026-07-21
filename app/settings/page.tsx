"use client"

import {
  MonitorCog,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { toast } from "sonner"

import { Notice, PageHero } from "@/components/cipherpix/ui"
import { Button } from "@/components/ui/button"
import { useHistoryStore } from "@/stores/history-store"
import {
  defaultSettings,
  type ThemePreference,
  useSettingsStore,
} from "@/stores/settings-store"

export default function SettingsPage() {
  const settings = useSettingsStore()
  const clearHistory = useHistoryStore((state) => state.clear)
  const { setTheme } = useTheme()
  const updateTheme = (theme: ThemePreference) => {
    settings.update({ theme })
    setTheme(theme)
  }

  return (
    <>
      <PageHero
        eyebrow="Local preferences"
        title="Settings"
        description="Control appearance, encryption defaults and local privacy behavior. These preferences contain no files or recovery keys."
      />
      <section className="page-container grid gap-6 pb-12 lg:grid-cols-2">
        <div className="surface-card">
          <div className="flex items-center gap-3">
            <MonitorCog className="text-primary" />
            <h2 className="text-2xl font-bold">Appearance</h2>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((theme) => (
              <button
                key={theme}
                className={`rounded-lg border px-3 py-3 text-sm font-semibold capitalize ${settings.theme === theme ? "border-primary bg-secondary text-secondary-foreground" : "bg-card"}`}
                onClick={() => updateTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
        <div className="surface-card">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="text-primary" />
            <h2 className="text-2xl font-bold">Encryption defaults</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Toggle
              label="Generate Caesar key automatically"
              checked={settings.generateKeyAutomatically}
              onChange={(value) =>
                settings.update({ generateKeyAutomatically: value })
              }
            />
            <label>
              <span className="label">Default Rail Fence value</span>
              <select
                className="field"
                value={settings.defaultRails}
                onChange={(event) =>
                  settings.update({ defaultRails: Number(event.target.value) })
                }
              >
                {Array.from({ length: 9 }, (_, index) => index + 2).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  )
                )}
              </select>
            </label>
            <label>
              <span className="label">Maximum image size</span>
              <select
                className="field"
                value={settings.maxImageSizeMb}
                onChange={(event) =>
                  settings.update({
                    maxImageSizeMb: Number(event.target.value),
                  })
                }
              >
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="20">20 MB</option>
              </select>
            </label>
            <Toggle
              label="Show save-settings confirmation"
              checked={settings.showSaveConfirmation}
              onChange={(value) =>
                settings.update({ showSaveConfirmation: value })
              }
            />
            <Toggle
              label="Include recovery-note metadata"
              checked={settings.recoveryMetadata}
              onChange={(value) => settings.update({ recoveryMetadata: value })}
            />
          </div>
        </div>
        <div className="surface-card">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary" />
            <h2 className="text-2xl font-bold">Privacy</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Toggle
              label="Store local activity history"
              checked={settings.storeHistory}
              onChange={(value) => settings.update({ storeHistory: value })}
            />
            <Toggle
              label="Clear temporary previews after processing"
              checked={settings.clearTemporaryPreviews}
              onChange={(value) =>
                settings.update({ clearTemporaryPreviews: value })
              }
            />
            <Toggle
              label="Clear workflow data after both downloads"
              checked={settings.clearAfterDownloads}
              onChange={(value) =>
                settings.update({ clearAfterDownloads: value })
              }
            />
            <Button
              variant="outline"
              onClick={() => {
                clearHistory()
                toast.success("Local history cleared")
              }}
            >
              <Trash2 /> Clear activity history
            </Button>
          </div>
        </div>
        <div className="space-y-5">
          <Notice title="Integrity verification is required">
            SHA-256 package checks and reverse verification cannot be disabled.
            This prevents CipherPix from presenting corrupted output as
            successfully recovered.
          </Notice>
          <Button
            variant="outline"
            onClick={() => {
              settings.reset()
              setTheme(defaultSettings.theme)
              toast.success("Settings reset")
            }}
          >
            <RotateCcw /> Reset all settings
          </Button>
        </div>
      </section>
    </>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        className="size-5"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}
