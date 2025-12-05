import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "木鱼28";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #fef7e8 0%, #f6f1e8 50%, #f5e6d3 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 背景装饰圆圈 */}
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(242,209,156,0.2) 0%, transparent 70%)",
              top: "-100px",
              right: "-100px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(216,141,61,0.15) 0%, transparent 70%)",
              bottom: "-50px",
              left: "-50px",
            }}
          />

          {/* 主要内容区域 */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "80px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* 左侧文字区域 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                flex: 1,
                maxWidth: "600px",
              }}
            >
              <div
                style={{
                  fontSize: "72px",
                  fontWeight: 700,
                  color: "#1f150a",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                木鱼28
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 500,
                  color: "#735733",
                  lineHeight: 1.4,
                }}
              >
                每天敲木鱼 28 次，好朋友一起打卡。
              </div>
            </div>

            {/* 右侧木鱼和木槌图标 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "400px",
                height: "400px",
              }}
            >
              {/* 木鱼 */}
              <div
                style={{
                  position: "relative",
                  width: "280px",
                  height: "280px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* 木鱼主体 */}
                <div
                  style={{
                    width: "240px",
                    height: "180px",
                    borderRadius: "120px 120px 100px 100px",
                    background:
                      "linear-gradient(180deg, #f5d5a8 0%, #d4a574 30%, #b8864f 70%, #8b5a2b 100%)",
                    border: "4px solid #8b5a2b",
                    position: "relative",
                    boxShadow: "0 20px 60px rgba(139, 90, 43, 0.3)",
                  }}
                >
                  {/* 木鱼高光 */}
                  <div
                    style={{
                      position: "absolute",
                      width: "200px",
                      height: "140px",
                      borderRadius: "100px 100px 80px 80px",
                      background:
                        "radial-gradient(ellipse at 50% 30%, rgba(255,249,230,0.6) 0%, transparent 70%)",
                      top: "10px",
                      left: "20px",
                    }}
                  />

                  {/* 敲击面 */}
                  <div
                    style={{
                      position: "absolute",
                      width: "180px",
                      height: "80px",
                      borderRadius: "90px",
                      background:
                        "radial-gradient(ellipse, #e8c99a 0%, #b8864f 100%)",
                      border: "3px solid #8b5a2b",
                      top: "-20px",
                      left: "30px",
                      boxShadow: "0 4px 12px rgba(139, 90, 43, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: "140px",
                        height: "60px",
                        borderRadius: "70px",
                        background: "rgba(201, 160, 103, 0.4)",
                        top: "10px",
                        left: "20px",
                      }}
                    />
                  </div>

                  {/* 可爱表情 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "60px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "20px",
                    }}
                  >
                    {/* 左眼 */}
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#5a3a1a",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#fff",
                          top: "2px",
                          left: "3px",
                        }}
                      />
                    </div>
                    {/* 右眼 */}
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#5a3a1a",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#fff",
                          top: "2px",
                          left: "3px",
                        }}
                      />
                    </div>
                  </div>

                  {/* 微笑 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "90px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "40px",
                      height: "20px",
                      border: "3px solid #5a3a1a",
                      borderTop: "none",
                      borderRadius: "0 0 40px 40px",
                    }}
                  />

                  {/* 脸颊红晕 */}
                  <div
                    style={{
                      position: "absolute",
                      width: "24px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "rgba(244, 165, 165, 0.4)",
                      top: "75px",
                      left: "50px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      width: "24px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "rgba(244, 165, 165, 0.4)",
                      top: "75px",
                      right: "50px",
                    }}
                  />
                </div>

                {/* 木槌 */}
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "20px",
                    transform: "rotate(-15deg)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* 木槌头 */}
                  <div
                    style={{
                      width: "50px",
                      height: "30px",
                      borderRadius: "25px",
                      background:
                        "linear-gradient(180deg, #8b6914 0%, #6b4e0f 100%)",
                      border: "2px solid #4a3509",
                      boxShadow: "0 4px 8px rgba(74, 53, 9, 0.3)",
                    }}
                  />
                  {/* 木槌柄 */}
                  <div
                    style={{
                      width: "12px",
                      height: "80px",
                      background:
                        "linear-gradient(180deg, #8b6914 0%, #6b4e0f 50%, #4a3509 100%)",
                      border: "1px solid #4a3509",
                      borderRadius: "6px",
                      marginTop: "-2px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error("OG 图片生成失败:", error);
    // 返回一个简单的错误图片
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#f6f1e8",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#1f150a",
          }}
        >
          木鱼28
        </div>
      ),
      {
        ...size,
        headers: {
          "Content-Type": "image/png",
        },
      }
    );
  }
}
