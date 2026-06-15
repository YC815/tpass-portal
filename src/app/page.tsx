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

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-extrabold text-2xl text-foreground">校園服務</h2>
            {!isLoggedIn && (
              <span className="font-mono text-sm font-bold text-muted-foreground border-2 border-foreground/30 rounded-md px-2 py-0.5">
                登入後解鎖
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
            © 2026 TSchool 學生會數位服務團隊
          </span>
        </div>
      </footer>
    </>
  );
}
