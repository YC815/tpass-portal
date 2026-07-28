// Portal（consumer）設定中心。只讀 env，集中管理「對接 auth 所需的最少資訊」。
// 邊界：portal 只需要 JWKS 公鑰來源與幾個 URL，絕不碰 auth 私鑰 / arctic / OAuth。
import "server-only";

const REQUIRED = [
  "AUTH_JWKS_URL",
  "AUTH_AUTHORIZE_URL",
  "AUTH_LOGOUT_URL",
  "PORTAL_SELF_URL",
  "TPASS_SERVICE_ID",
  "JWT_ISSUER",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[config/portal] 缺少必填環境變數：${missing.join(", ")}（請檢查 .env.local）`,
  );
}

const self = process.env.PORTAL_SELF_URL!;
const serviceId = process.env.TPASS_SERVICE_ID!;

// 登入回跳路徑可帶站內路徑，組成 authorize 入口（契約 v2，見 tpass-auth/INTEGRATION.md §7.1）。
export function loginUrlFor(returnPath = "/"): string {
  const u = new URL(process.env.AUTH_AUTHORIZE_URL!);
  u.searchParams.set("service", serviceId);
  u.searchParams.set("redirect_uri", `${self}/api/auth/callback`);
  u.searchParams.set("next", returnPath);
  return u.toString();
}

// auth 的 origin：/denied 與 /admin 都掛在 auth 網域下，用同一個 origin 推導，
// 不另外寫死網域——上線只要 AUTH_AUTHORIZE_URL 對，這兩個就自動對。
const authOrigin = new URL(process.env.AUTH_AUTHORIZE_URL!).origin;

// 選填：ban 頁網址；未設就用 authOrigin + /denied（本機/正式站通常都不用另外設）。
const deniedBaseUrl = process.env.AUTH_DENIED_URL || `${authOrigin}/denied`;

// read===false（被 ban 且未過期）時導去的頁面；帶 service 讓 /denied 知道查哪個服務的原因。
export function deniedUrlFor(serviceId: string): string {
  const u = new URL(deniedBaseUrl);
  u.searchParams.set("service", serviceId);
  return u.toString();
}

export const portalConfig = {
  // 公鑰來源：portal 只 fetch 這個，本地驗章。
  jwksUrl: process.env.AUTH_JWKS_URL!,
  // 未登入時導去的授權入口（v2：authorize → form_post token → 本服務 callback）。
  loginUrl: loginUrlFor("/"),
  // 登出走自己的 route：先清自己的 cookie，再鏈到 auth 清登入態。
  logoutUrl: `${self}/api/auth/logout`,
  // auth 端的登出入口（登出 route 內部用）。
  authLogoutUrl: process.env.AUTH_LOGOUT_URL!,
  // auth 的 /admin 權限管理 panel；permissions.auth.role !== "default" 才顯示入口。
  adminUrl: `${authOrigin}/admin`,
  selfUrl: self,
  serviceId,
  // 驗章時必須與 auth 簽發端一致。
  issuer: process.env.JWT_ISSUER!,
  // v2：本服務專屬 audience——別的服務的 token 在這裡驗不過（爆炸半徑隔離）。
  serviceAudience: `tpass:${serviceId}`,
  // v2：本服務自己的 host-only cookie（不設 Domain，別的子網域收不到）。
  ownCookieName: "tpass_token",
  cookieSecure: self.startsWith("https://"),
} as const;
