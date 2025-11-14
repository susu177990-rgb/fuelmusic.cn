import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6B4EFF, #9D88FF)",
          borderRadius: "32px",
          fontSize: 96,
          color: "#fff",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        F
      </div>
    ),
    { width: 180, height: 180 }
  );
}