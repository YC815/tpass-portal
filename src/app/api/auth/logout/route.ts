// POST /api/auth/logout — 兩段式登出（契約 v2）：
// 1. 清掉本服務自己的 host-only cookie（只有本服務能清）。
// 2. 回一頁自動送出的 form，POST 到 auth 的登出入口清 auth 登入態，
//    auth 再 303 導回本服務（帶 ?logout=1 純畫面提示）。
import { NextResponse } from "next/server";
import { portalConfig } from "@/config/portal";

export const runtime = "nodejs";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST() {
  const authLogout = `${portalConfig.authLogoutUrl}?redirect_uri=${encodeURIComponent(portalConfig.selfUrl)}`;
  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>登出中…</title></head>
<body onload="document.forms[0].submit()">
<form method="post" action="${escapeHtml(authLogout)}">
<noscript><button type="submit">完成登出</button></noscript>
</form>
</body></html>`;
  const response = new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
  response.cookies.set(portalConfig.ownCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: portalConfig.cookieSecure,
    path: "/",
    maxAge: 0,
  });
  return response;
}
