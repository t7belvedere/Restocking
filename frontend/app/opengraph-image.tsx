import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "restocking — alertes de retour en stock, taille par taille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          background: "#faf7f2",
          padding: "80px 100px",
          fontFamily: "system-ui, sans-serif",
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
            marginBottom: 48,
          }}
        />
        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color: "#1a1a1a",
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          Ta taille, pile quand
          <br />
          elle revient.
        </div>
        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 400,
            color: "#666",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Alertes de retour en stock par taille. Zara, COS, Aritzia,
          Sézane, Uniqlo et 120+ marques européennes.
        </div>
        {/* Bottom badge */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 60,
            right: 80,
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            restocking.app
          </div>
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#e87b35",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
