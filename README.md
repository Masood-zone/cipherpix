# CipherPix

**CipherPix: A Hybrid Image Encryption System Using Caesar Cipher and Rail Fence Algorithms**

CipherPix is a browser-based academic MVP that demonstrates substitution, transposition, binary packaging, recovery settings, and integrity verification using original image-file bytes. Files and recovery keys remain on the user's device.

> CipherPix uses classical ciphers for education. It does not provide modern production-grade encryption and must not be used for sensitive information.

## Technology

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4
- Shadcn/UI foundations, Base UI, Lucide icons, next-themes
- Zustand, React Hook Form, Zod
- Web Workers, Web Crypto, File API, `ArrayBuffer`, `Uint8Array`, Blob URLs
- Vitest, Testing Library, Playwright

There is no authentication, database, server upload, Cloudinary integration, analytics, or external file processing.

## Install and run

The repository uses pnpm and must continue to use its existing lockfile.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm start
pnpm exec playwright install chromium
pnpm test:e2e
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | How CipherPix works and the required academic warnings |
| `/encrypt` | Image validation, settings, local encryption and package creation |
| `/encrypt/result` | Temporary `.cpx` and recovery-note downloads |
| `/decrypt` | Package validation, recovery-note import and local decryption |
| `/decrypt/result` | Integrity-gated preview and recovered-image download |
| `/algorithms` | Interactive Caesar, Rail Fence and hybrid demonstrations |
| `/security` | Security properties, limitations and recommended uses |
| `/history` | Searchable non-sensitive local activity summaries |
| `/guide` | User instructions, common errors and privacy FAQ |
| `/about` | Academic scope and developer information |
| `/settings` | Local appearance, encryption and privacy preferences |

## Architecture

- `app/` contains App Router pages and result routes.
- `components/cipherpix/` contains workflow and reusable educational UI.
- `lib/cipherpix/` contains pure cryptographic functions, package parsing, validation, recovery-note helpers, downloads and the typed worker client.
- `workers/` performs CPU-heavy transformations away from the UI thread.
- `stores/` separates temporary in-memory workflow state from explicitly persisted, non-sensitive settings/history.
- `tests/` and `e2e/` contain deterministic unit/component and browser workflow coverage.

### Encryption flow

1. Validate extension, MIME type, binary signature, size and browser decodability.
2. Read the original file into a `Uint8Array`.
3. Calculate SHA-256 over those exact bytes.
4. Apply `(byte + key) mod 256` to every byte.
5. write the changed bytes rail-by-rail from the Rail Fence zigzag.
6. Build a versioned `.cpx` package.
7. Reverse both transformations in memory and compare SHA-256 before enabling download.

### Decryption flow

1. Parse and validate the complete `.cpx` structure.
2. Import or enter the external Caesar key and rail count.
3. Reconstruct zigzag order, then apply `(byte - key + 256) mod 256`.
4. Calculate SHA-256 over the recovered bytes.
5. Create a preview/download Blob only when the hash matches.

## `.cpx` version 1 format

The MIME type is `application/x-cipherpix`.

```text
offset  size       value
0       4 bytes    ASCII CPX1 magic
4       1 byte     unsigned package version (1)
5       4 bytes    unsigned big-endian JSON metadata length
9       variable   UTF-8 JSON metadata
...     remaining  raw encrypted bytes
```

Metadata records the algorithm identifier, original filename/MIME/extension/size, optional dimensions, SHA-256 checksum, timestamp, and encrypted payload length. It never contains the Caesar key or Rail Fence value. The parser bounds-checks lengths before slicing and rejects malformed JSON, missing data, unknown algorithms/versions, truncation and size mismatches.

## Recovery notes

Recovery settings are downloaded separately as `.cpx-key.json`:

```json
{
  "type": "CipherPix Recovery Note",
  "version": 1,
  "encryptedFileName": "campus-event.cpx",
  "caesarKey": 47,
  "railFenceRails": 3,
  "createdAt": "2026-07-20T12:00:00.000Z",
  "instructions": "Upload the .cpx file to CipherPix and import this recovery note."
}
```

Descriptive filename/date fields may be omitted through the metadata preference. The key and rails remain required. Anyone with both the package and note can recover the image.

## Privacy and local storage

Binary workflow data, images, previews, packages, checksums, keys, rail values, and recovery notes are never written to localStorage. Zustand keeps them in memory only, and Blob URLs are revoked on reset. Refreshing a result route intentionally shows a lost-result explanation.

localStorage may contain only:

- appearance, default rails, size limit and privacy preferences;
- activity ID, filename, operation, size, duration, integrity/status values, and timestamp.

History can be disabled or cleared. No third-party tracking is included.

## Browser support and limitations

CipherPix targets current evergreen browsers with Web Crypto, Web Workers, File APIs, `createImageBitmap`, Blob URLs, Canvas/image decoding and localStorage. Supported inputs are PNG, JPG/JPEG, WEBP and BMP, with a configurable maximum of 20 MB.

Classical Caesar/Rail Fence encryption has a tiny key space, predictable structure and no resistance comparable to authenticated modern encryption. SHA-256 verifies exact reconstruction; it does not make the classical cipher secure. Results are session-memory-only, cancellation is not offered, and very old browsers are unsupported.
