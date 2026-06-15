# T-Pass 系統架構決策紀錄

## 開發順序

UI-First 策略：先建立完整的靜態 UI（假登入 state），確認視覺與流程後，再接入 Auth.js + Google OIDC 邏輯。

| 階段              | 內容                                                   |
| ----------------- | ------------------------------------------------------ |
| 1. UI Shell       | Landing page、未登入 / 已登入兩種狀態                  |
| 2. Launchpad 卡片 | 從 `services.ts` config 渲染，disabled 與 enabled 狀態 |
| 3. 假登入 state   | `useState` 模擬 session，點擊後切換狀態                |
| 4. Auth 接入      | 換成 Auth.js + Google OIDC + JWT Cookie                |

---

## Service Registry 架構

### 設計原則

Launchpad 不寫死任何服務。它只做一件事：**讀取服務清單，然後渲染卡片**。新增或移除服務不需要動 UI 元件。

### Phase 1：靜態 Config（目前採用）

```typescript
// src/config/services.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string; // lucide-react icon name
  tone: "green" | "blue" | "orange" | "violet" | "rose";
  roles: ("student" | "teacher" | "all")[];
  enabled: boolean;
}

export const services: Service[] = [
  {
    id: "food",
    name: "線上點餐",
    description: "訂購今日午餐",
    url: "https://food.tschool.edu.tw",
    icon: "UtensilsCrossed",
    tone: "green",
    roles: ["all"],
    enabled: true,
  },
  // 新增服務 = 加一個物件
];
```

**新增服務流程**：在 `services.ts` 加一個物件 → PR review → 部署。

**升級至 Phase 2 的條件**：服務數量超過 10 個，或需要非技術人員（學生會幹部）透過 UI 管理服務清單時，才將 config 搬至資料庫並建立 `GET /api/services` 與 Admin UI。

---

## SSO 集中式驗證機制

### 網域結構

| 角色           | 網域                                            |
| -------------- | ----------------------------------------------- |
| 門戶大廳       | `portal.tschool.edu.tw`                         |
| 中央驗證中心   | `auth.tschool.edu.tw`                           |
| 子模組（範例） | `food.tschool.edu.tw`、`booking.tschool.edu.tw` |

### 登入流程

```
使用者在子模組點擊登入
  ↓
子模組重導向至：
  https://auth.tschool.edu.tw/login?redirect_uri=https://booking.tschool.edu.tw
  ↓
中央驗證系統引導 Google OIDC 登入
  ↓
登入成功 → 寫入頂層 Cookie
  Domain=.tschool.edu.tw; HttpOnly; Secure; SameSite=Lax
  ↓
讀取 redirect_uri（白名單驗證）→ 302 跳轉回子模組
  ↓
子模組讀取 Cookie → 自動登入，整個生態系同步
```

### 子模組團隊對接規範

登入按鈕只需一行：

```javascript
window.location.href = `https://auth.tschool.edu.tw/login?redirect_uri=${window.location.origin}`;
```

子模組不呼叫 Google，不自建 session。驗證狀態完全依賴頂層 Cookie 中的 JWT。

### 白名單安全機制

中央驗證系統在執行 redirect 前，必須驗證 `redirect_uri` 的 hostname 結尾為 `.tschool.edu.tw`，否則拒絕跳轉，防止 Open Redirect 釣魚攻擊。
實作時請讓我們可以在某個config裡面調整網域的hostname，因為我們還不確定能買到哪一個網域

### JWT Payload 規格

```json
{
  "sub": "1029384756473829102",
  "email": "b111002@tschool.edu.tw",
  "name": "林大明",
  "role": "student",
  "grade": 11,
  "exp": 1781528400
}
```

子模組從 Cookie 提取 JWT 並本地解密即可取得身分，不需呼叫 T-Pass API。
