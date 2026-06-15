"use client";

import {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  PackageSearch,
  Lock,
} from "lucide-react";
import type { Service, ServiceTone } from "@/config/services";

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  PackageSearch,
};

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
}

export function ServiceCard({ service, isLocked }: ServiceCardProps) {
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

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-foreground p-4 shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-foreground)] ${tc.cardBg}`}
    >
      <Icon className={`h-7 w-7 transition-transform duration-200 group-hover:-rotate-6 ${tc.iconText}`} />
      <span className="font-extrabold text-sm text-foreground text-center leading-tight">
        {service.name}
      </span>
    </a>
  );
}
