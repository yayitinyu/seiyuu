import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Seiyuu — A living archive of Japanese voices";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "65px 80px",
        background: "#f5f3ee",
        color: "#252722",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 55,
          fontFamily: "serif",
          borderBottom: "1px solid #d5d3ca",
          paddingBottom: 25,
        }}
      >
        seiyuu<span style={{ color: "#743b45" }}>.</span>
      </div>
      <div
        style={{
          fontSize: 80,
          display: "flex",
          flexDirection: "column",
          fontFamily: "serif",
          marginTop: 65,
          lineHeight: 1.15,
        }}
      >
        <span>A voice to remember.</span>
        <span>A person to discover.</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontSize: 18,
          color: "#743b45",
          letterSpacing: 3,
        }}
      >
        A LIVING ARCHIVE OF JAPANESE VOICES
      </div>
    </div>,
    size,
  );
}
