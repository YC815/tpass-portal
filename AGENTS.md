<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 生態系地圖在上層

本 repo 是 **tpass 生態系**的一個服務（id：`portal`，同時是消費端參考實作）。
整個生態系的地圖、跨服務規範、`services.json` 註冊表、`tpass` CLI 與部署流程，
都在上層 **tpass-ops** repo 的 `AGENTS.md` 與 `docs/`。動跨服務的東西前先讀那邊。

- 本機啟動一律用上層的 `scripts/tpass dev portal`（禁止裸 `npm run dev`）。
- SSO 串接合約（契約 v2）：`../tpass-auth/INTEGRATION.md`（權威）。
- 本 repo 是**消費端參考實作**：`src/lib/tpass-auth.ts`、`src/config/portal.ts`、
  `src/app/api/auth/{callback,logout}/route.ts` 這四個檔會被其他團隊照抄——
  改動它們前先想清楚，並同步更新上層 `docs/NEW-SERVICE.md` 裡的範例 code。
