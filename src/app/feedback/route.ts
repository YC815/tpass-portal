// GET /feedback —— 全平台唯一的「回報問題」入口（B5）。
//
// 為什麼要多這一層轉址，而不是各服務直接連問卷網址：
// 各服務的錯誤頁只知道 PORTAL_URL（既有 env，人人都有），不知道 T-Form 在哪、
// 更不知道回報問卷的 slug。把入口固定在 ${PORTAL_URL}/feedback，就等於
//   ① 各服務零新增 env ② 之後回報管道要換成 LINE / 別份問卷，只改這個檔一處。
//
// 目的地由「註冊表推導的 T-Form 網址 + 回報問卷 slug」組成，網域一律不寫死。
import { NextResponse } from "next/server";
import { registry, urlFor } from "@/lib/registry";
import { portalConfig } from "@/config/portal";

export const runtime = "nodejs";

// 逃生門：回報管道若改成問卷以外的東西（LINE 群、外部表單），設這顆 env 即可整條蓋過。
const OVERRIDE = process.env.FEEDBACK_URL;
// 回報問卷的固定 slug（T-Form 的 scripts/seed-feedback-form.ts 種進去的那份）。
const SLUG = process.env.FEEDBACK_FORM_SLUG || "feedback";

export async function GET() {
  if (OVERRIDE) return NextResponse.redirect(OVERRIDE, 307);

  const form = registry.services.find((s) => s.id === "form");
  // T-Form 若不在註冊表（或被停用），回報入口就沒有目的地——導回大廳，不要 500。
  if (!form) return NextResponse.redirect(new URL("/", portalConfig.selfUrl), 307);

  const target = `${urlFor(form, portalConfig.selfUrl)}/f/${SLUG}`;
  return NextResponse.redirect(target, 307);
}
