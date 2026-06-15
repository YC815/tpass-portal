"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/config/services";

const FAKE_USER = {
  name: "林同學",
  email: "b111002@tschool.edu.tw",
  role: "student" as const,
};

export default function HomePage() {
  const [session, setSession] = useState<typeof FAKE_USER | null>(null);
  const isLoggedIn = session !== null;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={() => setSession(null)} />

      <main className="flex-1">
        <HeroSection
          isLoggedIn={isLoggedIn}
          userName={session?.name ?? "同學"}
          onLogin={() => setSession(FAKE_USER)}
        />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isLocked={!isLoggedIn}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-dashed border-foreground/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-mono text-sm font-extrabold text-foreground">
            T<span className="text-primary">-</span>Pass
          </span>
          <span className="font-mono text-xs font-bold text-muted-foreground">
            © 2026 TSchool 學生會數位部
          </span>
        </div>
      </footer>
    </>
  );
}
