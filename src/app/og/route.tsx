import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "木鱼28";
export const size = {
  width: 1200,
  height: 800,
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 30% 20%, #ffe8b5 0, #f6f1e8 40%), radial-gradient(circle at 80% 10%, #ffe3d0 0, #f6f1e8 30%), #f6f1e8",
          color: "#1f150a",
          padding: "80px",
          fontSize: 48,
          fontWeight: 600,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              background:
                "conic-gradient(from 120deg, #f2d19c, #d88d3d, #f2d19c)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 20px 40px rgba(216, 141, 61, 0.25)",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "#fdf9f3",
                display: "grid",
                placeItems: "center",
                fontSize: 28,
              }}
            >
              28
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 20, color: "#7a5c3a" }}>木鱼 Mini App</span>
            <span style={{ fontSize: 58, fontWeight: 700 }}>每天敲木鱼 28 次</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            borderRadius: 26,
            background:
              "linear-gradient(135deg, rgba(242,209,156,0.9), rgba(216,141,61,0.9))",
            padding: 32,
            color: "#1f150a",
            boxShadow: "0 24px 48px rgba(216, 141, 61, 0.25)",
            fontSize: 36,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>每日 28 次 · 好友实时榜</span>
            <span style={{ fontSize: 26, color: "#4a351d" }}>
              Warpcast 一键打开，打卡养成习惯。
            </span>
          </div>
          <div
            style={{
              padding: "12px 18px",
              background: "#1f150a",
              color: "#fef7e8",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            敲一敲
          </div>
        </div>
      </div>
    ),
    size
  );
}
