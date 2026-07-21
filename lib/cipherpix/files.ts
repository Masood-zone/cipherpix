const formats = {
  png: { extensions: ["png"], mimeTypes: ["image/png"] },
  jpeg: { extensions: ["jpg", "jpeg"], mimeTypes: ["image/jpeg"] },
  webp: { extensions: ["webp"], mimeTypes: ["image/webp"] },
  bmp: { extensions: ["bmp"], mimeTypes: ["image/bmp", "image/x-ms-bmp"] },
} as const

export type SupportedImageFormat = keyof typeof formats

export interface InspectedFile {
  bytes: Uint8Array
  extension: string
  mimeType: string
  width?: number
  height?: number
}

function detectedFormat(bytes: Uint8Array): SupportedImageFormat | null {
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (byte, index) => bytes[index] === byte
    )
  )
    return "png"
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "jpeg"
  if (
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP"
  )
    return "webp"
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return "bmp"
  return null
}

export function validateImageBytes(
  name: string,
  mimeType: string,
  bytes: Uint8Array,
  maxBytes = 20 * 1024 * 1024
): SupportedImageFormat {
  if (bytes.length === 0) throw new Error("The selected image is empty.")
  if (bytes.length > maxBytes)
    throw new Error("This image exceeds the configured file-size limit.")
  const extension = name.split(".").pop()?.toLowerCase() ?? ""
  const format = detectedFormat(bytes)
  if (
    !format ||
    !formats[format].extensions.some((item) => item === extension) ||
    !formats[format].mimeTypes.some((item) => item === mimeType.toLowerCase())
  ) {
    throw new Error(
      "This file type is not supported. Choose a PNG, JPG, JPEG, WEBP or BMP image."
    )
  }
  return format
}

export async function inspectImageFile(
  file: File,
  maxBytes: number
): Promise<{
  bytes: Uint8Array
  width: number
  height: number
  format: SupportedImageFormat
}> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const format = validateImageBytes(file.name, file.type, bytes, maxBytes)
  try {
    const bitmap = await createImageBitmap(file)
    const result = { bytes, width: bitmap.width, height: bitmap.height, format }
    bitmap.close()
    return result
  } catch {
    throw new Error("This browser could not decode the selected image.")
  }
}

export function validateFileBytes(
  name: string,
  bytes: Uint8Array,
  maxBytes = 20 * 1024 * 1024
): void {
  if (bytes.length === 0) throw new Error("The selected file is empty.")
  if (bytes.length > maxBytes)
    throw new Error("This file exceeds the configured file-size limit.")
  if (!name.trim()) throw new Error("The selected file must have a name.")
}

export function normalizedMimeType(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase().split(";", 1)[0]
  return /^[\w!#$&^_.+-]+\/[\w!#$&^_.+-]+$/.test(normalized)
    ? normalized
    : "application/octet-stream"
}

export function fileExtension(fileName: string): string {
  const match = /\.([^.]+)$/.exec(fileName)
  return match?.[1].toLowerCase().slice(0, 32) ?? ""
}

export async function inspectFile(
  file: File,
  maxBytes: number
): Promise<InspectedFile> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  validateFileBytes(file.name, bytes, maxBytes)

  const result: InspectedFile = {
    bytes,
    extension: fileExtension(file.name),
    mimeType: normalizedMimeType(file.type),
  }

  if (file.type.toLowerCase().startsWith("image/") || detectedFormat(bytes)) {
    try {
      const bitmap = await createImageBitmap(file)
      result.width = bitmap.width
      result.height = bitmap.height
      bitmap.close()
    } catch {
      // Image previews are optional; encryption operates on arbitrary file bytes.
    }
  }

  return result
}

export function sanitizeFileName(
  value: string,
  fallback = "cipherpix-file"
): string {
  const safe = value
    .normalize("NFC")
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "-")
    .replace(/\.\.+/g, ".")
    .replace(/^\.+|[. ]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
  return safe || fallback
}

export function baseName(fileName: string): string {
  return sanitizeFileName(fileName.replace(/\.[^.]+$/, ""))
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}
