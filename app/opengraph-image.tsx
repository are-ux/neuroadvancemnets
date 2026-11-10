import { ImageResponse } from "next/og";

export const alt = "NeuroAdvancements. Understanding the brain. Exploring what is next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social sharing card, drawn in the brand colours. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#001A38",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 600 }}>
          <div style={{ width: 20, height: 20, borderRadius: 20, background: "#FC6A01" }} />
          NeuroAdvancements
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>Understanding the brain.</span>
          <span style={{ color: "#DDE8F1" }}>Exploring what&rsquo;s next.</span>
        </div>
      </div>
    ),
    size,
  );
}
