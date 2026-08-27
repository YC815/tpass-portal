<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 生態系地圖在上層

本 repo 是 **tpass 生態系**的一個服務（id：`portal`，同時是消費端參考實作）。
整個生態系的地圖、跨服務規範、`services.json` 註冊表、`tpass` CLI 與部署流程，
都在上層 **tpass-ops** repo 的 `AGENTS.md` 與 `docs/`。動跨服務的東西前先讀那邊。

- 本機啟動：`pnpm dev`（package.json 已設好 HTTPS + `portal.lvh.me:3001` + 消費端要的 `NODE_TLS_REJECT_UNAUTHORIZED=0`）。憑證放 `$HOME/tpass-certs`。
- SSO 串接合約（契約 v2）：`../tpass-auth/INTEGRATION.md`（權威）。
- 本 repo 是**消費端參考實作**：`src/config/portal.ts` 與
  `src/app/api/auth/{callback,logout}/route.ts` 這三個檔會被其他團隊照抄——
  改動它們前先想清楚，並同步更新上層 `docs/handbook/01-new-service.md` 裡的範例 code。
- 驗章本體不在這個 repo（C1，2026-08-27）：它住在套件 **`tpass-auth-js`**
  （`github:tschoolsu/tpass-auth-js`）。這裡只負責把 env 綁上去。
  要改驗章邏輯就去那個 repo 改，**不要**在這裡復活一份手抄副本。
