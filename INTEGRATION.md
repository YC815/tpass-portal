# T-Pass SSO 對接合約（Integration Guide）

這份文件給「要接 T-Pass 單一登入的子模組團隊」。讀完你就能讓自己的服務認出已登入的使用者，
**完全不需呼叫 auth 服務的 API、不碰 Google、不持有任何密鑰**。

> 本門戶（`t-pass`）本身就是這份合約的**參考實作**。對應檔案：
> - `src/lib/tpass-auth.ts` — 驗章核心（**照抄這個就對了**）
> - `src/config/portal.ts` — 對接所需的設定（env 來源）
> - `src/app/page.tsx` — 在 Server Component 取得身分並渲染
> - `server.mjs` / `package.json` 的 `start:https` — 本機 HTTPS 與信任憑證

---

## 一、運作原理（為什麼不用回呼 auth）

1. 使用者在你的服務點「登入」→ 瀏覽器導去 auth 的登入入口。
2. auth 跑完 Google OAuth，把使用者身分簽成一個 **EdDSA 簽章的 JWT**，寫進一個**頂層 cookie**
   （`Domain=.lvh.me`，整個 `*.lvh.me` 生態系都讀得到）。
3. auth 把瀏覽器導回你的服務。
4. 你的服務在**後端**讀那個 cookie，拿 auth 公開的 **JWKS 公鑰**在本地驗章，就知道是誰。

驗章是**非對稱簽章**：auth 用私鑰簽、你用公鑰驗。私鑰永遠不出 auth；你只需要公鑰，
所以你不需要、也拿不到任何祕密。auth 掛掉也不影響「已登入者」的驗章（公鑰可快取）。

---

## 二、你需要知道的東西

### Cookie

| 項目 | 值 |
| --- | --- |
| 名稱 | `tpass_session` |
| 屬性 | `HttpOnly`、`Secure`、`SameSite=Lax`、`Domain=.lvh.me`、`Path=/` |
| 內容 | 一個 EdDSA 簽章的 JWT（見下方 payload） |

⚠️ **`HttpOnly` 代表瀏覽器的 JavaScript 讀不到這個 cookie**（這是刻意的安全設計，防 XSS 竊 token）。
所以驗章**只能在後端做**（見第五節）。

### JWT Payload 欄位

| 欄位 | 型別 | 意義 |
| --- | --- | --- |
| `sub` | `string` | 使用者唯一識別碼（Google 的 `sub`） |
| `email` | `string` | 學校信箱 |
| `name` | `string` | 顯示名稱 |
| `role` | `string` | 角色，例如 `"student"`、`"teacher"` |
| `grade` | `string \| null` | 年級；目前可能為 `null`（auth 尚未接學籍目錄） |
| `iss` | `string` | 簽發者，必須等於 `https://auth.lvh.me:3000`（上線換正式網域） |
| `aud` | `string` | 受眾，必須等於 `tschool-sso` |
| `iat` | `number` | 簽發時間（Unix 秒） |
| `exp` | `number` | 到期時間（Unix 秒），目前 TTL 8 小時 |

JWT header：`{ "alg": "EdDSA", "kid": "tpass-key-1" }`。`kid` 用於金鑰輪替時對應正確公鑰。

### 公鑰來源（JWKS）

```
GET https://auth.lvh.me:3000/.well-known/jwks.json
```

回傳 `{ "keys": [ { kty:"OKP", crv:"Ed25519", alg:"EdDSA", use:"sig", kid:"tpass-key-1", x:"..." } ] }`。
用 `jose` 的 `createRemoteJWKSet(url)` 即可，它會**自動快取、依 `kid` 選鑰、金鑰輪替時自動重抓**。

---

## 三、驗章規則（安全關鍵，務必照做）

驗章時**一定**要：

1. **鎖演算法 `algorithms: ['EdDSA']`。**
   ❗ 不鎖會有 **alg confusion 偽造風險**：攻擊者可把 header 改成對稱演算法（如 `HS256`），
   並用「你公開的公鑰位元組」當 HMAC 祕鑰去簽一個假 token。若你沒鎖演算法，函式庫會用公鑰當對稱密鑰
   去驗，於是**任何人都能偽造任意身分**（包含 `role: "admin"`）。鎖死 `EdDSA` 就杜絕這條路。
2. **檢查 `issuer`**：必須是上面那個 `iss`，確認票是「這個 auth」簽的。
3. **檢查 `audience`**：必須是 `tschool-sso`，確認票是發給「我們這個生態系」。
4. **`exp` 過期要擋**（`jose` 預設會檢查）。

驗不過（過期 / 被竄改 / 錯 iss / 錯 aud / 錯演算法）就一律當成「未登入」，別讓 error 外洩。

最小實作（即 `src/lib/tpass-auth.ts`）：

```ts
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://auth.lvh.me:3000/.well-known/jwks.json"),
);

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],                       // 1. 鎖演算法
      issuer: "https://auth.lvh.me:3000",     // 2. 檢查 iss
      audience: "tschool-sso",                      // 3. 檢查 aud（exp 自動檢查）
    });
    return payload; // { sub, email, name, role, grade, ... }
  } catch {
    return null;
  }
}
```

---

## 四、登入 / 登出 URL

### 登入

未登入時，把使用者導去（`redirect_uri` 要**完整網址**、且必須是 `*.lvh.me`，否則 auth 回 400）：

```
https://auth.lvh.me:3000/api/auth/login?redirect_uri=<你的服務完整網址>
```

例：

```html
<a href="https://auth.lvh.me:3000/api/auth/login?redirect_uri=https://portal.lvh.me:3001">登入</a>
```

或 JS：

```js
location.href =
  "https://auth.lvh.me:3000/api/auth/login?redirect_uri=" +
  encodeURIComponent(location.origin);
```

### 登出（整個生態系一起登出）

`POST` 到 auth 的登出端點，它會清掉頂層 cookie：

```
POST https://auth.lvh.me:3000/api/auth/logout
```

```html
<form method="post" action="https://auth.lvh.me:3000/api/auth/logout">
  <button type="submit">登出</button>
</form>
```

---

## 五、⚠️ 重大限制：純前端 SPA 無法直接接

因為 `tpass_session` 是 **`HttpOnly`**，瀏覽器 JavaScript **拿不到也驗不了**它。
所以驗章**只能發生在後端**：

- ✅ Server Component / Route Handler / Middleware / 自家後端 API（Node、Go、任何能讀 cookie + 驗 JWT 的環境）
- ❌ 純瀏覽器端 React/Vue（`document.cookie` 讀不到，`fetch` 也碰不到那個 cookie）

如果你的服務是純前端 SPA，**必須自備一層後端**（哪怕只是一個讀 cookie、驗章、回 `{user}` 的 endpoint），
由那層後端做第三節的驗章。前端再跟自己的後端要身分。

---

## 六、本機開發須知（本階段測試環境）

- 兩個服務都跑 HTTPS：`auth.lvh.me:3000`、`portal.lvh.me:3001`，共用 mkcert 憑證。
- `lvh.me` 及其子網域由公共 DNS 直接解析到 `127.0.0.1`，**不需改 `/etc/hosts`**；只需信任 mkcert 根憑證。
  （之所以不用 `.test` 之類保留網域，是因為 Google OAuth 的 redirect URI 只接受有效公共 TLD。）
- 你的**後端在 fetch auth 的 HTTPS JWKS 時**，Node 不讀作業系統信任區，
  需設 `NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"`（見本專案 `package.json` 的 `start:https`）。
- 上線換成公開憑證（如 Let's Encrypt）後就不需要這個環境變數，網域也換成正式網域；
  以上所有 URL 都集中在 env / `src/config/portal.ts`，換網域只改設定。
