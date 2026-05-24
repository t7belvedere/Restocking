import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#faf7f2",
          padding: "80px 100px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            display: "flex",
            width: 120,
            height: 8,
            background: "#e87b35",
            borderRadius: 4,
            marginBottom: 56,
          }}
        />
        {/* Title — fit in 1000px at 68px */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            color: "#1a1a1a",
            letterSpacing: "-0.025em",
            marginBottom: 28,
            maxWidth: 1000,
          }}
        >
          <span>Your size, the moment</span>
          <span>it comes back.</span>
        </div>
        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 500,
            color: "#555",
            maxWidth: 750,
            lineHeight: 1.45,
          }}
        >
          Size-specific restock alerts for 120+ European
          fashion brands. Free for 3 products.
        </div>
        {/* Bottom badge */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 56,
            right: 80,
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            restocking.app
          </div>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#e87b35",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
