"use client"

import { create } from "zustand"

import type { CipherPixMetadata, ProcessingStage, RecoveryNote } from "@/lib/cipherpix/types"

export interface EncryptionResult {
  packageBlob: Blob
  recoveryBlob: Blob
  encryptedFileName: string
  recoveryFileName: string
  originalFileName: string
  originalSize: number
  encryptedSize: number
  key: number
  rails: number
  durationMs: number
  checksum: string
  integrityVerified: true
}

interface EncryptionState {
  result: EncryptionResult | null
  stage: ProcessingStage | null
  setStage: (stage: ProcessingStage | null) => void
  setResult: (result: EncryptionResult) => void
  reset: () => void
}

export const useEncryptionStore = create<EncryptionState>((set) => ({
  result: null,
  stage: null,
  setStage: (stage) => set({ stage }),
  setResult: (result) => set({ result, stage: "ready" }),
  reset: () => set({ result: null, stage: null }),
}))

export interface DecryptionResult {
  blob: Blob
  previewUrl: string
  metadata: CipherPixMetadata
  durationMs: number
  integrityVerified: true
}

interface DecryptionState {
  result: DecryptionResult | null
  packageMetadata: CipherPixMetadata | null
  recoveryNote: RecoveryNote | null
  stage: ProcessingStage | null
  setStage: (stage: ProcessingStage | null) => void
  setPackageMetadata: (metadata: CipherPixMetadata | null) => void
  setRecoveryNote: (note: RecoveryNote | null) => void
  setResult: (result: DecryptionResult) => void
  reset: () => void
}

export const useDecryptionStore = create<DecryptionState>((set, get) => ({
  result: null,
  packageMetadata: null,
  recoveryNote: null,
  stage: null,
  setStage: (stage) => set({ stage }),
  setPackageMetadata: (packageMetadata) => set({ packageMetadata }),
  setRecoveryNote: (recoveryNote) => set({ recoveryNote }),
  setResult: (result) => {
    const previous = get().result
    if (previous) URL.revokeObjectURL(previous.previewUrl)
    set({ result, stage: "ready" })
  },
  reset: () => {
    const result = get().result
    if (result) URL.revokeObjectURL(result.previewUrl)
    set({ result: null, packageMetadata: null, recoveryNote: null, stage: null })
  },
}))
