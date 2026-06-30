# T-Pass 校園核心服務門戶平台 — 產品需求文件 (PRD)

| 項目         | 內容                                   |
| :----------- | :------------------------------------- |
| **文件版本** | v1.1.0（技術段落已對齊實作）           |
| **專案主導** | TSchool 學生會數位服務團隊             |
| **發布日期** | 2026 年 6 月                           |
| **目標對象** | TSchool 全校師生 (Students & Teachers) |
| **技術架構** | Next.js 16 Full-Stack 生態系           |
| **文件狀態** | 第一階段 SSO 已實作；技術細節以本文件與 `design.md` / `INTEGRATION.md` 為準 |

> 📌 v1.1.0 變更：本文件原為 v1.0.0「Vibe Coding 基底版」草案，部分技術設想（暗色霓虹 UI、
> Auth.js、`grade` 為數字）在實作階段已調整。本版已將 §2、§3、§4 的技術描述校正為**實際做法**。
> 願景與背景（§1）維持不變。各細節的權威來源仍是 `t-pass/docs/design.md`（UI）與
> `auth/INTEGRATION.md`（串接）。

---

## 1. 專案概述與願景

隨著數位實驗高中（TSchool）校園生活機能的模組化發展，各類獨立的數位服務（如點餐、場地預約、社團簽到等）由各個學生團隊獨立開發。然而，缺乏統一的入口與身分驗證機制，導致師生必須重複登入、記憶多組網址，嚴重降低了使用者體驗。

**T-Pass** 是由 TSchool 學生會主導開發的**「校園核心服務門戶平台」**。它不僅是全校師生開啟數位校園生活的第一站（門戶大廳），更是整個數位校園生態系的「通行證發行中心（SSO Center）」。

### 1.1 核心願景 (Core Vision)

- **一鍵整合**：提供高質感的儀表板（Dashboard），集中管理校園所有模組化子服務按鈕。
- **單一登入 (SSO)**：全校師生僅需使用學校官方 Google 教育帳號登入一次，即可通行所有獨立發展的子模組。
- **去中心化維護**：允許各個學生技術團隊以不同技術框架自主開發子模組，彼此既相互聯動又保持資料與架構獨立。

> 💡 **學生視角產品定位 (User-Centric Positioning)**
> 對於學生與老師而言，T-Pass 不是一個冰冷的「登入中心」，而是一個充滿科技感、流暢且貼心的「校園生活轉運站」。它負責在背景默默處理繁瑣的資安憑證，將最乾淨、最直覺的服務控制台呈現給使用者。

---

## 2. 系統架構與關鍵技術底座

為兼顧團隊多人協作的敏捷度、AI 的高度支援性（Vibe Coding），以及系統的極致效能，本專案全面採取現代化全端架構與生態系設計。

### 2.1 技術棧 (Tech Stack) 配置

- **全端核心框架**：`Next.js 16 (React 19)` 搭配 `App Router`
  - _Vibe Coding 戰略意義_：AI (v0/Cursor) 的母語。前後端整合於單一專案，消滅 CORS 跨網域報錯，極利於 AI 詠唱。
- **效能自動優化**：`React Compiler` (全面啟用)
  - _Vibe Coding 戰略意義_：自動處理 Memoization。AI 粗心少寫優化語法時由編譯器自動擦屁股，免疫無限渲染 Bug。
- **UI 樣式**：`Tailwind CSS v4`（原子化類名，OKLCH 色彩）
  - _風格定位_：**Playful Tech / Bright Pop Tech，嚴格 light-only Neobrutalism**——白底、重邊框（`border-2`）、
    hard offset shadow、糖果色調。**沒有暗色模式、沒有霓虹發光**。完整 design system 見 `t-pass/docs/design.md`。
  - 圖示用 `lucide-react`。本階段未採用 shadcn/ui（元件直接以 Tailwind 手刻，符合 Neobrutalism 規範）。
- **身分驗證整合（發證端 `auth/`）**：`arctic`（Google OAuth）+ `jose`（簽 / 驗 JWT）
  - _做法_：發證端 `auth/` 自行跑 Google OAuth，用 **EdDSA（Ed25519）私鑰簽章** JWT 並寫入頂層 Cookie，
    對外公開 **JWKS 公鑰**。**未使用 Auth.js / NextAuth。** JWT 是**簽章**（可被公鑰驗證），**非加密**。
  - _消費端_：各服務只拿公鑰本地驗章，不持有私鑰、不回呼 auth。參考實作 `t-pass/src/lib/tpass-auth.ts`。

### 2.2 跨子網域憑證共享機制

T-Pass 採用**「共用網域 Cookie 頂層宣告」**。主入口網與所有子模組必須統一掛載於學校的主網域之下：

- **主門戶大廳網址**：`portal.tschool.edu.tw`
- **中央驗證中心（背景）**：`auth.tschool.edu.tw`
- **子模組網域範例**：`booking.tschool.edu.tw` (場地預約)、`food.tschool.edu.tw` (點餐)

當使用者於中央驗證成功後，系統將 JWT Token 寫入瀏覽器 Cookie，並將作用域（Domain）強制指定為點開頭的根網域 **`.tschool.edu.tw`**。此舉可確保師生直接開啟子模組書籤時，瀏覽器會自動攜帶該 Cookie，達成「零跳轉、無感同步登入」的極致體驗。

> ⚙️ **以上網域為上線目標值（正式根網域尚未確定購得）。所有網域 / issuer / audience 皆 env 驅動**
> （`auth/src/config/auth.ts`、`t-pass/src/config/portal.ts`），程式不寫死。
> **本機開發階段**實際跑在 `*.lvh.me`（`auth.lvh.me:3000` / `portal.lvh.me:3001`，cookie `Domain=.lvh.me`），
> 上線只改 `.env.local`。Cookie 名稱為 `tpass_session`，簽章演算法 `EdDSA`，audience `tschool-sso`。

---

## 3. 功能需求明細 (Functional Requirements)

本平台主要包含兩大核心功能模塊：中央集中式驗證系統、前端服務門戶大廳。

### 3.1 中央集中式驗證與動態同步 (Authentication & Sync)

支持全生態系中任何一個子應用單獨發起登入，並同步整套生態系的登入狀態。

| 功能 ID       | 功能名稱                                  | 詳細需求與運作邏輯描述                                                                                                                                                                                                                                     |
| :------------ | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **REQ-01-01** | 僅支援 Google 帳號認證                    | 系統不自建密碼庫。登入時強制導向 Google Workspace for Education 進行 OIDC 驗證，僅放行後綴為學校指定之 Email 帳號。                                                                                                                                        |
| **REQ-01-02** | 頂層 JWT Cookie 簽發                      | Google 驗證成功後，由核心後端將使用者基本身分資料封裝成 JWT，設定過期時間，並寫入屬性為 `Domain=.tschool.edu.tw; HttpOnly; Secure; SameSite=Lax` 的 Cookie 中。                                                                                            |
| **REQ-01-03** | 集中式驗證與重導向<br>(Redirect Handling) | 當未登入使用者直接存取子模組書籤（如 booking...）並點擊登入時，子模組需將網頁重導向至：<br>`https://auth.<根網域>/api/auth/login?redirect_uri=當前子模組完整網址`<br>（登入端點為 `/api/auth/login`；`redirect_uri` 須為**完整網址**）。中央系統驗證完成並寫入頂層 Cookie 後，依據 `redirect_uri` 自動將使用者閃導回原起點。登出為 `POST /api/auth/logout`。 |
| **REQ-01-04** | 白名單安全防禦                            | 中央驗證系統在執行重導向之前，必須檢查 `redirect_uri` 之 hostname 是否落在白名單根網域底下（本機 `lvh.me`、上線換正式根網域，由 `AUTH_ALLOWED_HOST_SUFFIX` 設定），否則回 `400 Invalid redirect_uri`，防止 Open Redirect 釣魚。 |

### 3.2 門戶大廳首頁儀表板 (Portal Dashboard)

提供師生登入、解鎖、導流前往各模組的一體化前端畫面。

- **未登入狀態**：light-only Neobrutalism 風格（白底、糖色、重邊框）。中央顯示醒目的「使用學校 Google 帳號登入」按鈕（帶 hard offset shadow）。下方服務卡片呈現 Disabled 狀態。
- **已登入狀態**：動態迎賓詞（如：「林同學，午安！今天想點什麼？」）。卡片全面啟用，滑鼠懸停（Hover）時上移並加深 hard shadow（**非霓虹發光、非漸層**；互動效果規範見 `design.md` 的 border & shadow 表）。
- **目前實作狀態**：首頁 `src/app/page.tsx` 為 Server Component，已接**真實跨網域驗章**——`getSession()` 讀頂層 cookie、用 JWKS 公鑰本地驗章取得身分（非 `useState` 假登入）。
- **整合服務發射台 (Launchpad)**：首頁預留模組化卡片區塊，第一階段必須包含以下服務按鈕：
  1. 線上點餐系統 (Food Ordering)
  2. 校園場地預約 (Venue Booking)
  3. 社團簽到與管理 (Club Management)
  4. 學生會即時公告 (SA Announcements)
  5. 遺失物尋找 (Lost & Found)

---

## 4. 團隊協作與對接規範 (For Submodule Teams)

為落實「架構解耦，自主發揮」的精神，核心團隊僅需向各子模組團隊公布以下兩項對接合約，即可讓各團隊自由使用 React, Vue, Python 或其擅長之技術獨立開發：

### 4.1 本地端無 API 驗證規範 (JWT Payload Specs)

各子模組不需發送網路請求給 T-Pass，只需自瀏覽器提取 Cookie 中的 JWT、用 auth 公開的 **JWKS 公鑰本地驗章**
即可取得使用者身分（是**驗章**，不是解密——payload 未加密，但需驗簽章）。驗章必做四鐵則：
鎖 `algorithms: ['EdDSA']`、檢查 `issuer`、檢查 `audience`、檢查 `exp`（完整規則見 `auth/INTEGRATION.md §5`）。
驗章通過後的 payload 結構如下：

```json
{
  "sub": "104857600293847561029",
  "email": "b11302042@tschool.tp.edu.tw",
  "name": "林大明",
  "role": "student",
  "grade": null,
  "iss": "https://auth.lvh.me:3000",
  "aud": "tschool-sso",
  "iat": 1750000000,
  "exp": 1750028800
}
```

> ⚠️ **型別與現況**：`grade` 型別是 `string | null`（**不是數字**），且目前**恆為 `null`**；`role` 目前**恆為 `"student"`**
> ——兩者皆為 placeholder，待 auth 接上學籍目錄後才有真實值。子模組程式**必須容忍** `grade` 為 `null`、
> 不可硬編「一定有年級」。`iss` / `aud` 為驗章必檢欄位。允許登入的 email 網域目前為 `@tschool.tp.edu.tw`
> （由 `AUTH_ALLOWED_EMAIL_DOMAIN` 設定，可能擴充）。
