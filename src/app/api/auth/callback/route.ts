// POST /api/auth/callback — 接收 auth 以 form_post 交付的 per-service token（契約 v2）。
// 驗章通過才寫進「本服務自己的」host-only cookie；token 全程不出現在 URL。
//
// ★ 參考實作 ★ 內容全在 tpass-auth-js（驗章四鐵則、Open Redirect 防線、cookie 屬性），
// 消費端要做的只有這一行。
import { tpass } from "@/config/portal";

export const runtime = "nodejs";

export const POST = tpass.callbackHandler;
