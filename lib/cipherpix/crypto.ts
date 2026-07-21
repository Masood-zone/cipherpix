function assertCaesarKey(key: number): void {
  if (!Number.isInteger(key) || key < 1 || key > 255) {
    throw new RangeError("The Caesar key must be an integer from 1 to 255.")
  }
}

function assertRails(rails: number): void {
  if (!Number.isInteger(rails) || rails < 2 || rails > 10) {
    throw new RangeError("The Rail Fence value must be an integer from 2 to 10.")
  }
}

export function caesarEncrypt(input: Uint8Array, key: number): Uint8Array {
  assertCaesarKey(key)
  const output = new Uint8Array(input.length)
  for (let index = 0; index < input.length; index += 1) {
    output[index] = (input[index] + key) & 0xff
  }
  return output
}

export function caesarDecrypt(input: Uint8Array, key: number): Uint8Array {
  assertCaesarKey(key)
  const output = new Uint8Array(input.length)
  for (let index = 0; index < input.length; index += 1) {
    output[index] = (input[index] - key + 256) & 0xff
  }
  return output
}

function railForIndex(index: number, rails: number): number {
  const cycle = 2 * (rails - 1)
  const position = index % cycle
  return position < rails ? position : cycle - position
}

export function railFenceEncrypt(input: Uint8Array, rails: number): Uint8Array {
  assertRails(rails)
  if (input.length < 2) return input.slice()

  const output = new Uint8Array(input.length)
  let cursor = 0
  for (let rail = 0; rail < rails; rail += 1) {
    for (let index = 0; index < input.length; index += 1) {
      if (railForIndex(index, rails) === rail) output[cursor++] = input[index]
    }
  }
  return output
}

export function railFenceDecrypt(input: Uint8Array, rails: number): Uint8Array {
  assertRails(rails)
  if (input.length < 2) return input.slice()

  const counts = new Uint32Array(rails)
  for (let index = 0; index < input.length; index += 1) {
    counts[railForIndex(index, rails)] += 1
  }

  const starts = new Uint32Array(rails)
  for (let rail = 1; rail < rails; rail += 1) {
    starts[rail] = starts[rail - 1] + counts[rail - 1]
  }

  const offsets = starts.slice()
  const output = new Uint8Array(input.length)
  for (let index = 0; index < output.length; index += 1) {
    const rail = railForIndex(index, rails)
    output[index] = input[offsets[rail]++]
  }
  return output
}

export function hybridEncrypt(input: Uint8Array, key: number, rails: number): Uint8Array {
  return railFenceEncrypt(caesarEncrypt(input, key), rails)
}

export function hybridDecrypt(input: Uint8Array, key: number, rails: number): Uint8Array {
  return caesarDecrypt(railFenceDecrypt(input, rails), key)
}

export async function sha256(input: Uint8Array): Promise<string> {
  const copy = Uint8Array.from(input)
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function checksumMatches(input: Uint8Array, expected: string): Promise<boolean> {
  return (await sha256(input)) === expected.toLowerCase()
}

export function generateCaesarKey(): number {
  const value = new Uint8Array(1)
  do crypto.getRandomValues(value)
  while (value[0] === 0)
  return value[0]
}
