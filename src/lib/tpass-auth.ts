// ★ T-Pass SSO 對接的「參考實作」★
// 本檔示範一個子模組（consumer）如何只靠 JWKS 公鑰，在自己後端本地驗章認出使用者，
// 全程不回呼 auth 服務、不碰 Google、不碰任何私鑰。其他團隊可直接照抄這個檔。
//
// 安全關鍵（務必照做）：
//   1. 鎖 algorithms: ['EdDSA'] —— 不鎖會有 alg confusion 偽造風險（公鑰被當對稱密鑰）。
//   2. 檢查 issuer / audience —— 確認是「這個 auth」「發給我們這個生態系」的票。
//   3. 驗章只能在 server 端做（cookie 是 HttpOnly，瀏覽器 JS 拿不到）。
import "server-only";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { portalConfig } from "@/config/portal";

// T-Pass 通行證的身分內容（對接合約，詳見 INTEGRATION.md）。
export interface TPassClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  grade: string | null;
  exp: number;
}

// createRemoteJWKSet 內建記憶體快取 + 依 kid 選鑰 + 金鑰輪替時自動重抓（含冷卻）。
// 首次驗章才會真的 fetch 一次 JWKS。
const JWKS = createRemoteJWKSet(new URL(portalConfig.jwksUrl));

// 驗一個 token。失敗（過期 / 竄改 / 錯 iss/aud / 錯演算法）一律回 null，不外拋。
export async function verifySession(token: string): Promise<TPassClaims | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],
      issuer: portalConfig.issuer,
      audience: portalConfig.audience,
    });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      grade: (payload.grade as string | null) ?? null,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

// 從頂層 cookie 讀目前 session，回 claims 或 null。
export async function getSession(): Promise<TPassClaims | null> {
  const token = (await cookies()).get(portalConfig.cookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}
