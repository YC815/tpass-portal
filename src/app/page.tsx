// 門戶首頁。Server Component：在伺服器端讀頂層 cookie、用 JWKS 本地驗章認出使用者。
// 沒有 "use client"、沒有 useState 假登入——身分完全來自跨網域 cookie 的本地驗章。
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ServiceCard } from "@/components/ServiceCard";
import { WarningBanner } from "@/components/WarningBanner";
import { AdminAccessCard } from "@/components/AdminAccessCard";
import { services, CATEGORY_SECTIONS } from "@/config/services";
import { tpass, portalConfig, loginUrlFor, deniedUrlFor } from "@/config/portal";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ logout?: string }>;
}) {
  const session = await tpass.getSession();
  const isLoggedIn = session !== null;
  // logout=1 只是 auth 導回來的畫面提示，不是憑證：只有在 session 確實無效時才採信。
  const { logout } = await searchParams;
  const justLoggedOut = !isLoggedIn && logout === "1";

  // 未登入就直接去 auth 換票（剛登出時不導，否則登不出去）。
  if (!isLoggedIn && !justLoggedOut) redirect(loginUrlFor("/"));

  // read 守門：正常情況 ban 在 authorize 階段就被攔下、根本換不到 token；這裡是給
  // 「舊票在被 ban 之後、過期之前」的窗口用的防禦層（見 INTEGRATION.md 權限變更生效時間）。
  const ownPerm = session ? tpass.permOf(session) : null;
  if (ownPerm && !ownPerm.read) redirect(deniedUrlFor(portalConfig.serviceId));

  // 大廳 token 帶全服務 map（含 "auth"）；role !== "default" 才顯示「權限管理」入口。
  const authPerm = session ? tpass.permOf(session, "auth") : null;
  const canManagePermissions = authPerm ? authPerm.role !== "default" : false;

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        userName={session?.name}
        loginUrl={portalConfig.loginUrl}
        logoutUrl={portalConfig.logoutUrl}
      />

      <main className="flex-1">
        {ownPerm?.restriction === "warning" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
            <WarningBanner reason={ownPerm.reason} until={ownPerm.until} />
          </div>
        )}

        <HeroSection
          isLoggedIn={isLoggedIn}
          userName={session?.name ?? "同學"}
          loginUrl={portalConfig.loginUrl}
          justLoggedOut={justLoggedOut}
        />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
          {/* 清單已由 registry 過濾（enabled + deployed + 有卡片資訊），這裡只依 category 分區，不再自己篩。 */}
          {CATEGORY_SECTIONS.map(({ key, label }) => {
            const sectionServices = services.filter((s) => s.category === key);
            if (sectionServices.length === 0) return null;
            return (
              <div key={key}>
                <h2 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 pb-2 border-b-2 border-dashed border-foreground/30">
                  {label}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sectionServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isLocked={!isLoggedIn}
                      restriction={session ? tpass.permOf(session, service.id).restriction : undefined}
                    />
                  ))}
                  {key === "governance" && canManagePermissions && (
                    <AdminAccessCard url={portalConfig.adminUrl} />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t-2 border-dashed border-foreground/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-mono text-sm font-extrabold text-foreground">
            T<span className="text-primary">-</span>Pass
          </span>
          <div className="flex items-center gap-4">
            {/* 回報入口（B5）：學生撞到 bug 的唯一出口，別拿掉。目的地見 app/feedback/route.ts。 */}
            <a
              href="/feedback"
              className="font-mono text-xs font-bold text-foreground underline decoration-2 underline-offset-4 hover:text-primary"
            >
              回報問題
            </a>
            <span className="font-mono text-xs font-bold text-muted-foreground">
              © 2026 TSchool 學生會數位部
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
