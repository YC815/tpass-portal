// Portal（consumer）設定中心。只讀 env，集中管理「對接 auth 所需的最少資訊」。
// 邊界：portal 只需要 JWKS 公鑰來源與幾個 URL，絕不碰 auth 私鑰 / arctic / OAuth。
import "server-only";

const REQUIRED = [
  "AUTH_JWKS_URL",
  "AUTH_LOGIN_URL",
  "AUTH_LOGOUT_URL",
  "PORTAL_SELF_URL",
  "JWT_ISSUER",
  "JWT_AUDIENCE",
  "TPASS_COOKIE_NAME",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[config/portal] 缺少必填環境變數：${missing.join(", ")}（請檢查 .env.local）`,
  );
}

const self = process.env.PORTAL_SELF_URL!;

export const portalConfig = {
  // 公鑰來源：portal 只 fetch 這個，本地驗章。
  jwksUrl: process.env.AUTH_JWKS_URL!,
  // 未登入時導去的登入入口（夾帶 redirect_uri 回到自己）。
  loginUrl: `${process.env.AUTH_LOGIN_URL}?redirect_uri=${encodeURIComponent(self)}`,
  // 登出：POST 到 auth，清掉頂層 cookie。
  logoutUrl: process.env.AUTH_LOGOUT_URL!,
  selfUrl: self,
  // 驗章時必須與 auth 簽發端一致。
  issuer: process.env.JWT_ISSUER!,
  audience: process.env.JWT_AUDIENCE!,
  cookieName: process.env.TPASS_COOKIE_NAME!,
} as const;
