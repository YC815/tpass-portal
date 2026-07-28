// ★ T-Pass SSO 對接的「參考實作」（契約 v2）★
// 本檔示範一個子模組（consumer）如何只靠 JWKS 公鑰，在自己後端本地驗章認出使用者，
// 全程不回呼 auth 服務、不碰 Google、不碰任何私鑰。其他團隊可直接照抄這個檔
// （連同 app/api/auth/callback、app/api/auth/logout 兩個 route）。
//
// 安全四鐵則（務必照做，缺一不可）：
//   1. 鎖 algorithms: ['EdDSA'] —— 不鎖會有 alg confusion 偽造風險（公鑰被當對稱密鑰）。
//   2. 檢查 issuer —— 確認票是「這個 auth」簽的。
//   3. 檢查 audience == tpass:<本服務id> —— 票是簽給「我」的；別的服務的 token 必須驗不過。
//   4. 檢查 exp（jose 預設會驗）。
// 驗章只能在 server 端做（cookie 是 HttpOnly，瀏覽器 JS 拿不到）。
import "server-only";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { portalConfig } from "@/config/portal";

// 權限 claim 契約（見 tpass-auth/INTEGRATION.md §3）。role 三級、admin 隱含 moderator；
// restriction 省略＝none；read 是唯一必看欄位，auth 已經算好（= restriction !== "ban"）。
export type Role = "admin" | "moderator" | "default";
export type Restriction = "none" | "warning" | "ban";

export interface PermissionEntry {
  read: boolean;
  role: Role;
  restriction?: Restriction;
  reason?: string;
  until?: number;
}

export type PermissionMap = Record<string, PermissionEntry>;

// T-Pass 通行證的身分內容（對接合約，詳見 tpass-auth/INTEGRATION.md）。
export interface TPassClaims {
  sub: string;
  email: string;
  name: string;
  // per-service 權限本體。一般服務 token 只含自己一把 key；本服務若在
  // AUTH_OVERVIEW_SERVICE_IDS（門戶）內，token 帶全服務 map（含 "auth"）。
  permissions: PermissionMap;
  exp: number;
}

// 安全預設值：claim 缺 permissions，或缺該 serviceId 這把 key（舊票／非 overview
// 服務對別的 serviceId 沒有資料）→ 一律視為「能讀、預設角色」，不因缺資料而誤鎖使用者。
const DEFAULT_PERMISSION_ENTRY: PermissionEntry = { read: true, role: "default" };

// 讀某人在某服務的權限。不傳 serviceId 預設查「自己這個服務」。
export function permOf(
  session: TPassClaims,
  serviceId: string = portalConfig.serviceId,
): PermissionEntry {
  return session.permissions[serviceId] ?? { ...DEFAULT_PERMISSION_ENTRY };
}

// createRemoteJWKSet 內建記憶體快取 + 依 kid 選鑰 + 金鑰輪替時自動重抓（含冷卻）。
// 首次驗章才會真的 fetch 一次 JWKS。
const JWKS = createRemoteJWKSet(new URL(portalConfig.jwksUrl));

// 驗一個 token。失敗（過期 / 竄改 / 錯 iss/aud / 錯演算法）一律回 null，不外拋。
export async function verifySession(
  token: string,
): Promise<TPassClaims | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],
      issuer: portalConfig.issuer,
      audience: portalConfig.serviceAudience,
    });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      permissions: (payload.permissions as PermissionMap | undefined) ?? {},
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

// 讀目前 session：看自己的 host-only cookie（v2）。
export async function getSession(): Promise<TPassClaims | null> {
  const token = (await cookies()).get(portalConfig.ownCookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}
