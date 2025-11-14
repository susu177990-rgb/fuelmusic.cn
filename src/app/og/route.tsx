import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(107,78,255,0.35), #000)",
          color: "#fff",
          fontSize: 64,
          letterSpacing: 1,
          fontWeight: 600,
        }}
      >
        福乐音乐工作室 · Fuel Music Studio
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
