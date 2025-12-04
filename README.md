# 木鱼28 · Farcaster Mini App

每天敲木鱼 28 次，自动限制次数并实时展示好友榜。基于 **Next.js + @farcaster/miniapp-sdk + Vercel**，可直接提交到 Warpcast Mini App。

## 快速开始

```bash
git clone https://github.com/thursdaycapital/muyu30
cd muyu30
npm install
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | 你的部署域名（本地 `http://localhost:3000`，上线后改成 `https://muyu30.vercel.app` 或自定义域） |
| `MAX_KNOCKS` / `NEXT_PUBLIC_MAX_KNOCKS` | 每日上限，默认为 28 |
| `KNOCK_TTL_SECONDS` | 数据过期时间，默认 3 天 |
| `QUICK_AUTH_DOMAIN` | Quick Auth 验证域名，建议与上线域名一致 |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV（或 Upstash Redis 兼容）配置，用于持久化计数和榜单 |
| `ALLOW_DEMO` | 本地可设为 `true` 以跳过鉴权，线上请保持 `false` |

## 功能

- 每人每天自动限流 28 次（可通过 env 调整）。
- `/api/state` 返回今日进度与榜单；`/api/knock` 负责敲击 + 更新排行榜。
- 使用 `sdk.quickAuth.fetch` 携带 Bearer Token；后端用 `@farcaster/quick-auth` 校验。
- UI 内置 “收藏” 按钮，调用 `sdk.actions.addMiniApp`。
- `/.well-known/farcaster.json`、`fc:miniapp` meta、`/og` 图像、`/muyu.svg` 图标均已就位。

## 部署到 Vercel

1. `npm run build` 本地确认通过。
2. Vercel 新建项目指向该仓库，Node 版本 >= 22。
3. 在 Vercel 环境变量中填写 `.env.example` 所需项（至少 `NEXT_PUBLIC_APP_URL`、`QUICK_AUTH_DOMAIN`、KV 相关）。
4. 重新部署，访问 `<域名>/.well-known/farcaster.json` 和 `<域名>/og` 确认可达。

## 上架 Warpcast / Mini Apps

1. 开启 Warpcast 开发者模式。
2. 确认页面 `<head>` 中已有 `fc:miniapp`（或 `fc:frame`）元信息，按钮会跳转到 `homeUrl`。
3. 在 `public/.well-known/farcaster.json` 中替换 `accountAssociation` 为你 fid 的签名，`homeUrl` 等域名保持与部署一致，`webhookUrl` 填写接收通知的后端（可先留空或示例）。
4. 在 Warpcast 的 Developer Tools 中添加 Mini App，指向你的域名，完成审核/自测。
5. 分享任何页面链接即可生成带按钮的卡片并可一键打开。

## 接口与存储

- **GET `/api/state`**：返回 `{ fid, day, count, remaining, leaderboard[] }`
- **POST `/api/knock`**：增加一次敲击，超过上限返回 400
- 存储：优先使用 Vercel KV；无 KV 时使用内存（仅开发调试）。

## 设计说明

- 竖屏友好布局，顶部进度 + 大按钮 + 实时榜单。
- `sdk.actions.ready()` 在加载完成后触发，避免长时间白屏。
- OG 图 `/og` 比例 3:2，Splash 图标 `/muyu.svg` 尺寸 200x200。

## 清单（可执行）

1) 填写 `.env.local`（域名、KV、Quick Auth）  
2) 更新 `public/.well-known/farcaster.json` 的 `accountAssociation` 与域名  
3) `npm run build && npm run start`（本地）或 Vercel 部署  
4) Warpcast Developer Tools 验证 `fc:miniapp`、Manifest 可访问  
5) 发布 Mini App，分享链接测试按钮与敲击+榜单流程  
6) 如需推送通知，在后端实现 `webhookUrl` 并处理 `miniapp_added` 等事件
