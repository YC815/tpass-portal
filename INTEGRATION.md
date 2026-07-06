# T-Pass SSO 對接合約（消費端視角・契約 v2）

這份文件給「要接 T-Pass 單一登入的子模組團隊」。讀完你就能讓自己的服務認出已登入的使用者，
**完全不需呼叫 auth 服務的 API、不碰 Google、不持有任何密鑰**。

> **完整權威合約在 `tpass-auth/INTEGRATION.md`**（payload 欄位、錯誤碼、FAQ、多語言範本都在那）。
> 本檔是消費端的速讀版 + 指向參考實作。
>
> 本門戶（`tpass-portal`）本身就是合約的**參考實作**。照抄這四個檔、把 `portal` 換成你的服務 id：
> - `src/lib/tpass-auth.ts` — 驗章核心（安全四鐵則）
> - `src/config/portal.ts` — 對接所需的設定（env 來源）
> - `src/app/api/auth/callback/route.ts` — 接收 token、寫自己的 cookie
> - `src/app/api/auth/logout/route.ts` — 兩段式登出

---

## 一、運作原理（v2：per-service token + host-only cookie）

1. 你的後端判定「沒有有效 session」→ 導去 auth 的 **authorize** 入口（帶你的服務 id、
   callback 網址、站內回跳路徑）。
2. auth（必要時先跑 Google OAuth）簽一顆 **只對你有效** 的 EdDSA JWT（`aud=tpass:<你的id>`），
   用自動送出的 form **POST 到你的 callback**——token 不進 URL、不進 Referer、不進瀏覽器歷史。
3. 你的 callback 用 auth 公開的 **JWKS 公鑰**本地驗章，驗過才寫進**你自己網域的 host-only cookie**。
4. 之後每個請求：後端讀自己的 cookie → 本地驗章 → 認出使用者。全程不回呼 auth。

為什麼要 v2？v1 的共用頂層 cookie（`Domain=.根網域`）會把同一張全生態通行證送到**每一個**
子網域——任何一個服務被攻破或子網域被接管，等於全生態帳號淪陷。v2 的 token 一服務一張、
cookie 只留在自己網域，爆炸半徑縮到單一服務。

---

## 二、你需要的東西

| 項目 | 值 |
| --- | --- |
| 服務 id | 向 auth 管理者登記（進 `AUTH_SERVICE_IDS` 白名單 + tpass-ops `services.json`） |
| authorize 入口 | `GET <auth>/api/auth/authorize?service=<id>&redirect_uri=<你的callback>&next=<站內路徑>` |
| 你的 callback | `POST /api/auth/callback`（收 form 欄位 `token`+`next`） |
| 你的 cookie | `tpass_token`：**host-only（不設 Domain）**、`HttpOnly`、`Secure`、`SameSite=Lax`、`Path=/` |
| 驗章 | `EdDSA` 鎖死 + `iss` + `aud=tpass:<id>` + `exp`（四鐵則，缺一不可） |
| JWKS | `GET <auth>/.well-known/jwks.json`（`createRemoteJWKSet` 自動快取/選鑰） |
| 登出 | 你自己的 `POST /api/auth/logout`：清自己 cookie → form POST auth logout |

JWT payload：`sub / email / name / role / grade / iss / aud / iat / exp`。
⚠️ `role` 目前恆為 `"student"`、`grade` 恆為 `null`（placeholder）——**權限判斷用你服務內的
allowlist，不要信 `role`**。

---

## 三、驗章規則（安全四鐵則，逐條必做）

```ts
const { payload } = await jwtVerify(token, JWKS, {
  algorithms: ["EdDSA"],        // 1. 鎖演算法（防 alg confusion 偽造）
  issuer: JWT_ISSUER,            // 2. 票是「這個 auth」簽的
  audience: `tpass:${SERVICE_ID}`, // 3. 票是簽給「我」的（v2 隔離核心）
});                               // 4. exp 由 jose 預設檢查
```

- 不鎖 `algorithms` = 任何人可拿公開的 JWKS 公鑰偽造 `role:"admin"` token（HS256 混淆）。
- `aud` 驗錯值（例如還在驗 v1 的 `tschool-sso`）= 失去 v2 的隔離，等於白升級。
- 驗不過一律當「未登入」，不要把 error 丟給前端。

---

## 四、登入 / 登出

**登入**：未登入 → 302 到 authorize（三個參數都必填）：

```
https://auth.lvh.me:3000/api/auth/authorize
  ?service=portal
  &redirect_uri=https://portal.lvh.me:3001/api/auth/callback
  &next=/
```

你的 callback 要做三件事（照抄 `src/app/api/auth/callback/route.ts`）：
驗章（四鐵則）→ 寫 host-only cookie（`maxAge` ≤ token 剩餘壽命）→ 檢查 `next` 是站內路徑後 303。

**登出**（兩段式，照抄 `src/app/api/auth/logout/route.ts`）：

```html
<form method="post" action="/api/auth/logout"><button>登出</button></form>
```

你的 route 清自己的 cookie，再自動 form POST 到 auth 的 logout 清 auth 登入態；
auth 303 導回你的服務（帶 `?logout=1`，純畫面提示、不是身分憑證）。
其他服務的 cookie 留到各自過期（≤8h）——這是 v2 用隔離換來的已知取捨。

---

## 五、⚠️ 重大限制：純前端 SPA 無法直接接

cookie 是 `HttpOnly`、callback 要在 server 驗章——**必須有後端**。
純前端 SPA 要自備薄後端（callback + `/api/me`），前端跟自己的後端要身分。
**絕不把 token 放 `localStorage`。**

---

## 六、本機開發須知

- 全生態用 mkcert HTTPS + `*.lvh.me`（公共 DNS 指向 127.0.0.1，免改 hosts）。
- 一律用上層 tpass-ops 的 **`tpass dev <你的id>`** 啟動——它會處理 mkcert 信任與
  Next/undici 不吃 `NODE_EXTRA_CA_CERTS` 的坑。禁止裸 `npm run dev`。
- 所有 URL / id 都在 env（`src/config/portal.ts` 的 REQUIRED 清單），換網域只改 `.env.local`。

---

## 附：v1 → v2 遷移狀態

遷移期本服務的 `getSession()` 先讀自己的 `tpass_token`，沒有才 fallback 讀 v1 共用
`tpass_session`（既有登入者不被強制重登）。auth 停發 v1 cookie 後，fallback 與
`JWT_AUDIENCE` / `TPASS_COOKIE_NAME` env 一併移除。詳見 `tpass-auth/INTEGRATION.md` 附錄 A。
