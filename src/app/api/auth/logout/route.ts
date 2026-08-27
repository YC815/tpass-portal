// POST /api/auth/logout — 兩段式登出（契約 v2）：
// 1. 清掉本服務自己的 host-only cookie（只有本服務能清）。
// 2. 回一頁自動送出的 form，POST 到 auth 的登出入口清 auth 登入態，
//    auth 再 303 導回本服務（帶 ?logout=1 純畫面提示）。
//
// ★ 參考實作 ★ 兩段都在 tpass-auth-js 裡，消費端只有這一行。
import { tpass } from "@/config/portal";

export const runtime = "nodejs";

export const POST = tpass.logoutHandler;
