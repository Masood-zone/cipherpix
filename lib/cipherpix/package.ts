import { z } from "zod"

import {
  CPX_MAGIC,
  CPX_VERSION,
  type CipherPixMetadata,
  type ParsedCipherPixPackage,
} from "./types"

const HEADER_SIZE = 9
const MAX_METADATA_LENGTH = 1024 * 1024

const metadataSchema = z.object({
  magic: z.literal(CPX_MAGIC),
  version: z.literal(CPX_VERSION),
  algorithm: z.literal("CAESAR_RAIL_FENCE"),
  originalFileName: z.string().min(1),
  originalMimeType: z.string().min(1),
  originalExtension: z.string(),
  originalSize: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  checksumAlgorithm: z.literal("SHA-256"),
  originalChecksum: z.string().regex(/^[a-f0-9]{64}$/i),
  encryptedAt: z.string().datetime(),
  encryptedDataLength: z.number().int().positive(),
})

function packageError(message: string): Error {
  return new Error(message)
}

export function createCipherPixPackage(
  metadata: CipherPixMetadata,
  encryptedData: Uint8Array,
): Uint8Array {
  const parsedMetadata = metadataSchema.parse({
    ...metadata,
    encryptedDataLength: encryptedData.length,
  })
  if (encryptedData.length === 0) throw packageError("Missing encrypted data.")

  const metadataBytes = new TextEncoder().encode(JSON.stringify(parsedMetadata))
  if (metadataBytes.length > MAX_METADATA_LENGTH) throw packageError("Metadata is too large.")

  const output = new Uint8Array(HEADER_SIZE + metadataBytes.length + encryptedData.length)
  output.set(new TextEncoder().encode(CPX_MAGIC), 0)
  output[4] = CPX_VERSION
  new DataView(output.buffer).setUint32(5, metadataBytes.length, false)
  output.set(metadataBytes, HEADER_SIZE)
  output.set(encryptedData, HEADER_SIZE + metadataBytes.length)
  return output
}

export function parseCipherPixPackage(input: Uint8Array): ParsedCipherPixPackage {
  if (input.length < HEADER_SIZE) throw packageError("This CipherPix package may be damaged or incomplete.")
  const magic = new TextDecoder().decode(input.subarray(0, 4))
  if (magic !== CPX_MAGIC) throw packageError("This file is not a valid CipherPix package.")
  if (input[4] !== CPX_VERSION) {
    throw packageError("This CipherPix file was created with an unsupported package version.")
  }

  const metadataLength = new DataView(input.buffer, input.byteOffset, input.byteLength).getUint32(5, false)
  if (metadataLength === 0 || metadataLength > MAX_METADATA_LENGTH) {
    throw packageError("The package contains an invalid metadata length.")
  }
  const payloadStart = HEADER_SIZE + metadataLength
  if (payloadStart >= input.length) throw packageError("This CipherPix package may be damaged or incomplete.")

  let unknownMetadata: unknown
  try {
    unknownMetadata = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(input.subarray(HEADER_SIZE, payloadStart)))
  } catch {
    throw packageError("The CipherPix package metadata is malformed.")
  }

  const result = metadataSchema.safeParse(unknownMetadata)
  if (!result.success) throw packageError("The CipherPix package metadata is invalid.")
  const encryptedData = input.slice(payloadStart)
  if (result.data.encryptedDataLength !== encryptedData.length) {
    throw packageError("The encrypted data size does not match the package metadata.")
  }
  return { metadata: result.data, encryptedData }
}

export function validateCipherPixPackage(input: Uint8Array): { valid: true } | { valid: false; error: string } {
  try {
    parseCipherPixPackage(input)
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Invalid CipherPix package." }
  }
}

export function isCipherPixFile(input: Uint8Array): boolean {
  return input.length >= 5 && new TextDecoder().decode(input.subarray(0, 4)) === CPX_MAGIC && input[4] === CPX_VERSION
}
