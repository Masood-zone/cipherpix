export const CPX_MIME_TYPE = "application/x-cipherpix"
export const CPX_MAGIC = "CPX1"
export const CPX_VERSION = 1 as const

export interface CipherPixMetadata {
  magic: typeof CPX_MAGIC
  version: typeof CPX_VERSION
  algorithm: "CAESAR_RAIL_FENCE"
  originalFileName: string
  originalMimeType: string
  originalExtension: string
  originalSize: number
  width?: number
  height?: number
  checksumAlgorithm: "SHA-256"
  originalChecksum: string
  encryptedAt: string
  encryptedDataLength: number
}

export interface ParsedCipherPixPackage {
  metadata: CipherPixMetadata
  encryptedData: Uint8Array
}

export interface RecoveryNote {
  type: "CipherPix Recovery Note"
  version: 1
  encryptedFileName?: string
  caesarKey: number
  railFenceRails: number
  createdAt?: string
  instructions: string
}

export type ProcessingStage =
  | "reading"
  | "hashing"
  | "caesar"
  | "rail-fence"
  | "packaging"
  | "verifying"
  | "ready"

export interface ActivityRecord {
  id: string
  fileName: string
  operation: "encrypt" | "decrypt"
  fileSize: number
  durationMs: number
  integrityStatus: "verified" | "failed"
  status: "completed" | "failed"
  createdAt: string
}
