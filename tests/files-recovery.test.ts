import { describe, expect, it } from "vitest"

import { sanitizeFileName, validateImageBytes } from "@/lib/cipherpix/files"
import { createRecoveryNote, parseRecoveryNote, serializeRecoveryNote } from "@/lib/cipherpix/recovery"

const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10, 0)

describe("image validation", () => {
  it("accepts matching extension, MIME and binary signature", () => expect(validateImageBytes("campus.png", "image/png", png)).toBe("png"))
  it("does not trust extension alone", () => expect(() => validateImageBytes("campus.png", "image/png", Uint8Array.of(1, 2, 3))).toThrow("not supported"))
  it("rejects empty and oversized files", () => {
    expect(() => validateImageBytes("x.png", "image/png", new Uint8Array())).toThrow("empty")
    expect(() => validateImageBytes("x.png", "image/png", png, 2)).toThrow("file-size")
  })
})

describe("filenames", () => {
  it("preserves valid Unicode while removing traversal and reserved characters", () => {
    expect(sanitizeFileName("../../校園:event?.png")).toBe("校園-event-.png")
  })
  it("uses a fallback for an unusable name", () => expect(sanitizeFileName("...", "fallback")).toBe("fallback"))
})

describe("recovery notes", () => {
  it("round-trips a versioned recovery note", () => {
    const note = createRecoveryNote(47, 3, "campus.cpx", true)
    expect(parseRecoveryNote(serializeRecoveryNote(note))).toMatchObject({ caesarKey: 47, railFenceRails: 3, encryptedFileName: "campus.cpx" })
  })
  it.each(["not json", "{}", '{"type":"CipherPix Recovery Note","version":1,"caesarKey":0,"railFenceRails":3,"instructions":"x"}'])("rejects invalid note %s", (value) => expect(() => parseRecoveryNote(value)).toThrow())
})
