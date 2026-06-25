// 門戶首頁。Server Component：在伺服器端讀頂層 cookie、用 JWKS 本地驗章認出使用者。
// 沒有 "use client"、沒有 useState 假登入——身分完全來自跨網域 cookie 的本地驗章。
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/config/services";
import { getSession } from "@/lib/tpass-auth";
import { portalConfig } from "@/config/portal";

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = session !== null;

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        loginUrl={portalConfig.loginUrl}
        logoutUrl={portalConfig.logoutUrl}
      />

      {session && (
        <div className="border-b-2 border-dashed border-primary/40 bg-primary/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
            <p className="font-mono text-[11px] sm:text-xs font-bold text-foreground/80 leading-relaxed">
              ✓ Portal 本地驗章認得你：
              <span className="text-primary">{session.name}</span>（
              {session.email}）· role={session.role}
              <span className="block text-foreground/50 font-medium">
                此身分完全由 portal 端 JWKS 本地驗章取得，未回呼 auth 服務。
              </span>
            </p>
          </div>
        </div>
      )}

      <main className="flex-1">
        <HeroSection
          isLoggedIn={isLoggedIn}
          userName={session?.name ?? "同學"}
          loginUrl={portalConfig.loginUrl}
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
