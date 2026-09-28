import { ImageResponse } from "next/og";

export const alt = "Aakash Vatsal, founder, builder and creator of HSAKAA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#030608",
          color: "white",
          padding: "72px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "680px",
            height: "680px",
            borderRadius: "999px",
            right: "-190px",
            top: "-260px",
            background: "rgba(198,255,50,0.10)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#C6FF32",
            }}
          />
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#C6FF32",
            }}
          >
            AAKASH VATSAL
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              display: "flex",
              maxWidth: "960px",
              fontSize: "82px",
              lineHeight: 0.96,
              fontWeight: 900,
              letterSpacing: "-0.06em",
            }}
          >
            Building systems. Sharing the thinking.
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: "900px",
              fontSize: "30px",
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            Companies, journal, reading, health, media, HSAKAA and HSAKAA Aid.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "24px",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div style={{ display: "flex" }}>aakashvatsal.com</div>
          <div style={{ display: "flex", fontWeight: 800, color: "white" }}>
            Founder · Builder · HSAKAA
          </div>
        </div>
      </div>
    ),
    size,
  );
}
