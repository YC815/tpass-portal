"use client";

import {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  SearchX,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import type { Service, ServiceTone } from "@/config/services";

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  SearchX,
};

const TONE_CLASSES = {
  green:  { cardBg: "bg-tone-green-bg",  iconBg: "bg-tone-green-badge",  iconText: "text-tone-green-text"  },
  blue:   { cardBg: "bg-tone-blue-bg",   iconBg: "bg-tone-blue-badge",   iconText: "text-tone-blue-text"   },
  orange: { cardBg: "bg-tone-orange-bg", iconBg: "bg-tone-orange-badge", iconText: "text-tone-orange-text" },
  violet: { cardBg: "bg-tone-violet-bg", iconBg: "bg-tone-violet-badge", iconText: "text-tone-violet-text" },
  rose:   { cardBg: "bg-tone-rose-bg",   iconBg: "bg-tone-rose-badge",   iconText: "text-tone-rose-text"   },
} satisfies Record<ServiceTone, { cardBg: string; iconBg: string; iconText: string }>;

interface ServiceCardProps {
  service: Service;
  isLocked: boolean;
}

export function ServiceCard({ service, isLocked }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] ?? UtensilsCrossed;
  const tc = TONE_CLASSES[service.tone];

  if (isLocked) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center gap-3 rounded-2xl border-2 border-foreground px-4 py-3 shadow-[4px_4px_0_0_var(--color-foreground)] opacity-50 blur-[1.5px] cursor-not-allowed select-none pointer-events-none ${tc.cardBg}`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] ${tc.iconBg}`}>
          <Lock className={`h-4 w-4 ${tc.iconText}`} />
        </span>
        <span className="flex-1 font-extrabold text-sm text-foreground leading-tight">
          {service.name}
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    );
  }

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-2xl border-2 border-foreground px-4 py-3 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)] ${tc.cardBg}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-transform duration-200 group-hover:-rotate-6 ${tc.iconBg}`}>
        <Icon className={`h-4 w-4 ${tc.iconText}`} />
      </span>
      <span className="flex-1 font-extrabold text-sm text-foreground leading-tight">
        {service.name}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
