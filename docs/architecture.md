# T-Pass 架構決策紀錄（portal 視角）

> ⚠️ **這份文件的前身（2026-06-15 版）描述的是 v1 架構**：頂層共用 cookie
> `Domain=.tschool.edu.tw`、`role` / `grade` claim、Auth.js、以及「服務清單搬進 portal 的 DB」路線。
> **那些全部已經作廢**，v1 已於 2026-07-13 從程式碼徹底移除。
> 本文已於 2026-07-31 重寫為現況；跨服務規範的權威文件在上層 **tpass-ops** repo 與
> `tpass-auth/INTEGRATION.md`，本文只記 portal 自己的決策與它們的理由。

---

## 服務清單：為什麼 portal 不擁有它

大廳卡片全部派生自 public repo `tschoolsu/tpass-registry` 的 `services.json`（portal 在 build 時讀
`../tpass-registry/services.json`，見 `src/lib/registry.ts`）；欄位定義與登記流程見該 repo 的 README
與上層 `docs/handbook/04-registry-sop.md`，這裡不重述。以下只記 portal 自己的決策理由。

### 為什麼要從硬編碼改成派生（2026-07-31）

以前卡片是 `src/config/services.ts` 的硬編碼陣列 + 一顆顆 `<SVC>_URL` env，登記一個服務要碰
三個 repo、五個位置，漏任何一處都是無聲失敗（最典型：本機看得到卡片、線上永遠看不到）。
改成派生後，登記 = 對 `tpass-registry` 開一個 PR，portal 零改動、零新 env。

### 為什麼是讀檔而不是打 API

註冊表是「部署時就決定好」的靜態事實。讓大廳在 runtime 去問另一個服務要清單，
只是把一次 git merge 換成一個新的故障點。代價是 registry 更新後 **portal 必須重新部署**
才會生效——這個代價是刻意接受的。

### 為什麼不搬進資料庫

舊版這份文件曾規劃「服務數量超過 10 個就把 config 搬進 DB + Admin UI」。**已否決。**
搬進 DB 會讓「新增一個服務」變成一次沒有 diff、沒有 review、沒有歷史的 SQL 寫入。
服務清單同時也是 **auth 的發證白名單**，這種東西應該要有 PR 紀錄。

### 圖示為什麼是白名單

`src/config/icons.ts` 維護一份 lucide 圖示白名單，registry 用了清單外的名字，portal
**啟動時直接丟錯並印出可用清單**（`src/config/services.ts`），不靜默 fallback。

替代方案是 `lucide-react/dynamic` 的 `DynamicIcon`，它能吃任何圖示名，但只能在 client 端
`useEffect` 之後才載入——每次進大廳都會先閃一排空卡。用白名單換取 SSR，代價是偶爾要多加一行；
那一行不會被忘記，因為忘了就啟動不了。

---

## SSO：portal 是消費端參考實作

portal 對 auth 的關係與其他任何子服務完全相同——**它沒有任何特權**，一樣只拿公鑰驗章。
完整契約見 `../tpass-auth/INTEGRATION.md`（權威），這裡只記三個容易誤解的點：

- **token 一服務一張**：portal 拿到的是 `aud=tpass:portal`，在別的服務驗不過，反之亦然。
- **cookie 是 host-only**：不設 `Domain`，所以只有 `portal.<根網域>` 收得到。
  v1 那種 `Domain=.<根網域>` 的共用 cookie 已經移除，**不要復活它**。
- **唯一的例外待遇**：portal 的 token 帶「全服務 permissions map」而非只有自己一把 key
  （auth 端的 `AUTH_OVERVIEW_SERVICE_IDS`，預設就是 `portal`）。這是為了在大廳畫出各服務的
  ban / warning 徽章，以及決定要不要顯示「權限管理」入口。

## 授權

一律讀 JWT 的 `permissions` claim（`perm.read` / `perm.role`）。
名單維護在 auth 的 `/admin` panel，**portal 不自維護任何 allowlist**。
`groups` claim 已於 2026-07-27 全面移除，token 裡不會再有這個欄位。
