// Portal（consumer）設定中心。只讀 env，集中管理「對接 auth 所需的最少資訊」。
// 邊界：portal 只需要 JWKS 公鑰來源與幾個 URL，絕不碰 auth 私鑰 / arctic / OAuth。
//
// ★ 參考實作（C1 之後）★ 驗章本體已經抽成套件 tpass-auth-js，六個服務不再各抄一份。
// 這個檔剩下的工作只有「把本服務的 env 綁上去」，其他團隊照抄的也是這一段。
import "server-only";
import { configFromEnv, createTpassNextAuth } from "tpass-auth-js/next";

// 缺必填 env 就直接 throw（fail closed）。REQUIRED 清單的真相在套件裡：
// AUTH_JWKS_URL / AUTH_AUTHORIZE_URL / AUTH_LOGOUT_URL / TPASS_SERVICE_ID / JWT_ISSUER
// ＋這裡指定的「自己的網址」那一顆。
export const tpass = createTpassNextAuth(configFromEnv("PORTAL_SELF_URL"));

// 登入回跳路徑可帶站內路徑，組成 authorize 入口（契約 v2，見 tpass-auth/INTEGRATION.md §7.1）。
export function loginUrlFor(returnPath = "/"): string {
  return tpass.loginUrl(returnPath);
}

// read===false（被 ban 且未過期）時導去的頁面；帶 service 讓 /denied 知道查哪個服務的原因。
export function deniedUrlFor(serviceId: string): string {
  return tpass.deniedUrl(serviceId);
}

export const portalConfig = {
  // 未登入時導去的授權入口（v2：authorize → form_post token → 本服務 callback）。
  loginUrl: tpass.loginUrl("/"),
  // 登出走自己的 route：先清自己的 cookie，再鏈到 auth 清登入態。
  logoutUrl: tpass.logoutUrl,
  // auth 的 /admin 權限管理 panel；permissions.auth.role !== "default" 才顯示入口。
  adminUrl: tpass.adminUrl,
  selfUrl: tpass.selfUrl,
  serviceId: tpass.serviceId,
} as const;
