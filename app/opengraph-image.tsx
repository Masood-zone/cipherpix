import { ImageResponse } from "next/og"

export const alt =
  "CipherPix — local academic image encryption with Caesar Cipher and Rail Fence"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #172554 55%, #083344 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#2563eb",
              borderRadius: 16,
              display: "flex",
              height: 64,
              justifyContent: "center",
              marginRight: 20,
              width: 64,
            }}
          >
            CP
          </div>
          CipherPix
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "-2px",
            lineHeight: 1.05,
            marginTop: 54,
          }}
        >
          Learn how image bytes are changed, rearranged, and recovered.
        </div>
        <div
          style={{
            color: "#bae6fd",
            fontSize: 28,
            lineHeight: 1.4,
            marginTop: 30,
          }}
        >
          Caesar Cipher + Rail Fence · Local browser processing · SHA-256
          integrity
        </div>
        <div
          style={{
            color: "#94a3b8",
            display: "flex",
            fontSize: 20,
            marginTop: 58,
          }}
        >
          Academic cryptography demonstration · Secure Every Pixel.
        </div>
      </div>
    </div>,
    size
  )
}
