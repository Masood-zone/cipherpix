import { describe, expect, it } from "vitest"

import { caesarDecrypt, caesarEncrypt, checksumMatches, hybridDecrypt, hybridEncrypt, railFenceDecrypt, railFenceEncrypt, sha256 } from "@/lib/cipherpix/crypto"

describe("Caesar byte transformation", () => {
  it.each([1, 255])("round-trips with key %i without mutating input", (key) => {
    const input = Uint8Array.of(0, 1, 127, 254, 255)
    const snapshot = input.slice()
    const encrypted = caesarEncrypt(input, key)
    expect(input).toEqual(snapshot)
    expect(caesarDecrypt(encrypted, key)).toEqual(input)
  })

  it("wraps byte values modulo 256", () => expect(caesarEncrypt(Uint8Array.of(255), 1)).toEqual(Uint8Array.of(0)))
  it.each([0, 256, 1.5])("rejects invalid key %s", (key) => expect(() => caesarEncrypt(new Uint8Array(), key)).toThrow(RangeError))
})

describe("Rail Fence byte transformation", () => {
  it.each([2, 3, 4, 10])("round-trips odd and even arrays with %i rails", (rails) => {
    for (const length of [0, 1, 2, 9, 10, 101]) {
      const input = Uint8Array.from({ length }, (_, index) => (index * 37) & 0xff)
      expect(railFenceDecrypt(railFenceEncrypt(input, rails), rails)).toEqual(input)
    }
  })

  it("preserves a sequence when rails exceed its length", () => {
    const input = Uint8Array.of(9, 4)
    expect(railFenceDecrypt(railFenceEncrypt(input, 10), 10)).toEqual(input)
  })
})

describe("hybrid and SHA-256", () => {
  it("round-trips a deterministic large array", () => {
    const input = Uint8Array.from({ length: 250_000 }, (_, index) => (index * 19 + 7) & 0xff)
    expect(hybridDecrypt(hybridEncrypt(input, 255, 10), 255, 10)).toEqual(input)
  })

  it("compares real SHA-256 values", async () => {
    const input = new TextEncoder().encode("CipherPix")
    const digest = await sha256(input)
    expect(digest).toHaveLength(64)
    await expect(checksumMatches(input, digest)).resolves.toBe(true)
    await expect(checksumMatches(new TextEncoder().encode("changed"), digest)).resolves.toBe(false)
  })
})
