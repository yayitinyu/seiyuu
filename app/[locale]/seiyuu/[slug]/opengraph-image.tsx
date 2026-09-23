import { ImageResponse } from "next/og";
import { getPerson } from "@/lib/content";
import { notFound } from "next/navigation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Seiyuu — Voice archive profile";
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const person = getPerson(slug);
  if (!person) notFound();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f5f3ee",
        color: "#252722",
      }}
    >
      <div
        style={{
          width: 330,
          background: "#743b45",
          color: "#f5f3ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 140,
        }}
      >
        {person.names.romaji
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "65px 60px",
        }}
      >
        <span style={{ fontSize: 40, fontFamily: "serif" }}>seiyuu.</span>
        <span
          style={{
            fontSize: 78,
            fontFamily: "serif",
            marginTop: 75,
            lineHeight: 1.1,
          }}
        >
          {person.names.romaji}
        </span>
        <span style={{ fontSize: 25, marginTop: 35, color: "#743b45" }}>
          {person.tagline.en}
        </span>
        <span style={{ fontSize: 16, marginTop: "auto", letterSpacing: 3 }}>
          VOICE / CHARACTER / MEMORY
        </span>
      </div>
    </div>,
    size,
  );
}
