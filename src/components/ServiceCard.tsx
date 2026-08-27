"use client";

import { UtensilsCrossed, Lock } from "lucide-react";
import { ICON_MAP } from "@/config/icons";
import type { Service, ServiceTone } from "@/config/services";
import type { Restriction } from "tpass-auth-js";

const TONE_CLASSES = {
  green:  { cardBg: "bg-tone-green-bg",  iconText: "text-tone-green-text"  },
  blue:   { cardBg: "bg-tone-blue-bg",   iconText: "text-tone-blue-text"   },
  orange: { cardBg: "bg-tone-orange-bg", iconText: "text-tone-orange-text" },
  violet: { cardBg: "bg-tone-violet-bg", iconText: "text-tone-violet-text" },
  rose:   { cardBg: "bg-tone-rose-bg",   iconText: "text-tone-rose-text"   },
} satisfies Record<ServiceTone, { cardBg: string; iconText: string }>;

interface ServiceCardProps {
  service: Service;
  isLocked: boolean;
  // 該服務的管制狀態（僅登入時有意義）；未登入或未管制一律當 "none"。
  restriction?: Restriction;
}

// 角落徽章：ban 用 rose「禁止使用」、warning 用 orange「警告」，兩者互斥、共用同一視覺位置。
function CornerBadge({ tone, label }: { tone: "rose" | "orange"; label: string }) {
  const cls =
    tone === "rose"
      ? "bg-tone-rose-badge text-tone-rose-text"
      : "bg-tone-orange-badge text-tone-orange-text";
  return (
    <span
      className={`absolute -top-2 -right-2 rounded-md border-2 border-foreground px-2 py-0.5 font-mono text-[10px] font-bold shadow-[2px_2px_0_0_var(--color-foreground)] ${cls}`}
    >
      {label}
    </span>
  );
}

export function ServiceCard({ service, isLocked, restriction = "none" }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] ?? UtensilsCrossed;
  const tc = TONE_CLASSES[service.tone];

  if (isLocked) {
    return (
      <div
        aria-hidden="true"
        className={`aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--color-foreground)] opacity-50 blur-[1.5px] cursor-not-allowed select-none pointer-events-none ${tc.cardBg}`}
      >
        <Lock className={`h-7 w-7 ${tc.iconText}`} />
        <span className="font-extrabold text-sm text-foreground text-center leading-tight">
          {service.name}
        </span>
      </div>
    );
  }

  // ban：卡片灰掉、不可點——跟未登入的鎖定視覺區隔開（不 blur，徽章文字要看得清楚）。
  if (restriction === "ban") {
    return (
      <div
        aria-hidden="true"
        className={`relative aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--color-foreground)] opacity-50 grayscale cursor-not-allowed select-none pointer-events-none ${tc.cardBg}`}
      >
        <CornerBadge tone="rose" label="禁止使用" />
        <Icon className={`h-7 w-7 ${tc.iconText}`} />
        <span className="font-extrabold text-sm text-foreground text-center leading-tight">
          {service.name}
        </span>
      </div>
    );
  }

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)] ${tc.cardBg}`}
    >
      {restriction === "warning" && <CornerBadge tone="orange" label="警告" />}
      <Icon className={`h-7 w-7 transition-transform duration-200 group-hover:-rotate-6 ${tc.iconText}`} />
      <span className="font-extrabold text-sm text-foreground text-center leading-tight">
        {service.name}
      </span>
    </a>
  );
}
