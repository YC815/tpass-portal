// 消費端範本：restriction="warning" 時的呈現，其他服務可直接照抄本檔。
// 呈現方式由各模組自訂（design.md 沒有硬性版型），這裡示範 orange 系 Neobrutalism 橫幅。
import { TriangleAlert } from "lucide-react";

interface WarningBannerProps {
  reason?: string;
  until?: number;
}

function formatUntil(until: number): string {
  return new Date(until * 1000).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function WarningBanner({ reason, until }: WarningBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-foreground bg-tone-orange-bg px-4 py-3 shadow-[3px_3px_0_0_var(--color-foreground)]">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-tone-orange-text" />
      <div className="text-sm font-bold text-tone-orange-text">
        <p>{reason ? `警告：${reason}` : "帳號已被標記警告，請留意使用規範。"}</p>
        {until !== undefined && (
          <p className="mt-0.5 font-mono text-xs">將於 {formatUntil(until)} 解除</p>
        )}
      </div>
    </div>
  );
}
