# tpass-portal（T-Pass 門戶大廳）

T-Pass 生態系的發射台：師生用學校 Google 帳號登入一次，看到自己有權進的服務卡片。
同時是 **SSO 消費端參考實作**——其他服務照抄它的串接寫法：
`src/config/portal.ts`（把 env 綁進 `tpass-auth-js`）+ `src/app/api/auth/{callback,logout}/route.ts`（各一行）。

## 本機跑

```bash
pnpm install
pnpm dev        # https://portal.lvh.me:3001（package.json 已設好 HTTPS + NODE_TLS_REJECT_UNAUTHORIZED=0）
```

憑證在 `$HOME/tpass-certs`（上層 `scripts/tpass setup` 產生）。要一次跑 auth + portal + 其他服務用上層 `scripts/tpass dev`。
註冊表 `../tpass-registry/services.json` 必須並排存在，大廳卡片由它派生（`src/lib/registry.ts`），portal 不自帶服務清單。

檢查：`pnpm lint` + `pnpm exec tsc --noEmit`。

## 環境變數

範本 `.env.example`，真值寫 `.env.local`（不進 git）。必填清單的真相在 `src/config/portal.ts`
（`configFromEnv("PORTAL_SELF_URL")`，其餘由 `tpass-auth-js` 定義：`AUTH_JWKS_URL` / `AUTH_AUTHORIZE_URL` /
`AUTH_LOGOUT_URL` / `TPASS_SERVICE_ID` / `JWT_ISSUER`）。缺就 fail closed。

## 部署

`tpass deploy portal`（上層 tpass-ops CLI）。註冊表改了要重部署 portal 才會反映到卡片。

## 資料庫

沒有。

## 文件

- 本 repo 的 agent 規則：`AGENTS.md`；portal 自己的架構決策：`docs/architecture.md`；design system：`docs/design.md`。
- SSO 合約：`tpass-auth/INTEGRATION.md`。生態系地圖與部員手冊：上層 tpass-ops 的 `AGENTS.md` 與 `docs/handbook/`。
