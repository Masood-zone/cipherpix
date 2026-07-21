import { z } from "zod"

import type { RecoveryNote } from "./types"

export const recoveryNoteSchema = z.object({
  type: z.literal("CipherPix Recovery Note"),
  version: z.literal(1),
  encryptedFileName: z.string().min(1).optional(),
  caesarKey: z.number().int().min(1).max(255),
  railFenceRails: z.number().int().min(2).max(10),
  createdAt: z.string().datetime().optional(),
  instructions: z.string().min(1),
})

export function createRecoveryNote(
  caesarKey: number,
  railFenceRails: number,
  encryptedFileName: string,
  includeMetadata: boolean,
): RecoveryNote {
  return recoveryNoteSchema.parse({
    type: "CipherPix Recovery Note",
    version: 1,
    ...(includeMetadata ? { encryptedFileName, createdAt: new Date().toISOString() } : {}),
    caesarKey,
    railFenceRails,
    instructions: "Upload the .cpx file to CipherPix and import this recovery note.",
  })
}

export function parseRecoveryNote(value: string): RecoveryNote {
  let unknownNote: unknown
  try {
    unknownNote = JSON.parse(value)
  } catch {
    throw new Error("This recovery note is not valid JSON.")
  }
  const result = recoveryNoteSchema.safeParse(unknownNote)
  if (!result.success) throw new Error("This is not a valid CipherPix recovery note.")
  return result.data
}

export function serializeRecoveryNote(note: RecoveryNote): string {
  return JSON.stringify(recoveryNoteSchema.parse(note), null, 2)
}
