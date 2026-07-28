// 「權限管理」卡：只有 permissions.auth.role !== "default"（admin/moderator）才會被渲染。
// 連去 auth 的 /admin panel；url 由呼叫端傳入（config/portal.ts 的 adminUrl，由
// AUTH_AUTHORIZE_URL 的 origin 推導，不寫死網域）。視覺沿用 ServiceCard 的卡片樣式。
import { ShieldCheck } from "lucide-react";

interface AdminAccessCardProps {
  url: string;
}

export function AdminAccessCard({ url }: AdminAccessCardProps) {
  return (
    <a
      href={url}
      className="group aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-foreground bg-tone-violet-bg p-4 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      <ShieldCheck className="h-7 w-7 text-tone-violet-text transition-transform duration-200 group-hover:-rotate-6" />
      <span className="font-extrabold text-sm text-foreground text-center leading-tight">
        權限管理
      </span>
    </a>
  );
}
