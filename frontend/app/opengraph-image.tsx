import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "restocking — alertes de retour en stock, taille par taille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_BASE64 = `iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAAACXBIWXMAAC4jAAAuIwF4pT92AAAFxGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgMTAuMC1jMDAwIDc5LmQyMGU0NjYzMCwgMjAyNS8xMi8wOS0wMjoxMToyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI3LjQgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA1LTI0VDEyOjI3OjM0KzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wNS0yNVQxNToyMDo0OCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wNS0yNVQxNToyMDo0OCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjVkMWU1ZGQtYjlkNS00OGQ0LWE1N2ItZmNiYjg1MzZjZTNiIiB4bXBNTTpEb2N1bWVu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`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={`data:image/png;base64,${LOGO_BASE64}`}
            alt="restocking logo"
            width={180}
            height={180}
            style={{ borderRadius: 36, marginBottom: 32 }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            restocking
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 400,
              color: "#a0a0a0",
              lineHeight: 1.3,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Ta taille, pile quand elle revient.
          </div>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 5,
              background: "#e87b35",
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
