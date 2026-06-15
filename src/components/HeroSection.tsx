"use client";

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "早安" : h < 18 ? "午安" : "晚安";
}

interface HeroSectionProps {
  isLoggedIn: boolean;
  userName: string;
  onLogin: () => void;
}

export function HeroSection({
  isLoggedIn,
  userName,
  onLogin,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--color-foreground) 16%, transparent) 1.4px, transparent 1.4px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(75% 65% at 50% 0%, black, transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-6">
          {isLoggedIn ? (
            <>
              <span className="rounded-md border-2 border-foreground bg-card px-3 py-1 font-mono text-xs font-bold text-primary">
                已解鎖
              </span>
              <h1 className="font-extrabold text-4xl sm:text-5xl text-foreground tracking-tight leading-tight">
                {userName}，{getGreeting()}！
              </h1>
              <p className="text-xl font-medium text-muted-foreground">
                今天需要什麼服務呢？
              </p>
            </>
          ) : (
            <>
              <span className="rounded-md border-2 border-foreground bg-card px-3 py-1 font-mono text-xs font-bold text-foreground">
                BETA
              </span>
              <h1 className="font-extrabold text-4xl sm:text-5xl text-foreground tracking-tight leading-tight max-w-lg">
                校園核心服務門戶
              </h1>
              <p className="text-lg font-medium text-muted-foreground max-w-md">
                TSchool 全校師生的數位生活轉運站。登入一次，解鎖所有校園服務。
              </p>
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-2.5 rounded-xl border-2 border-foreground bg-card px-6 py-3 font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-foreground)]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                    fill="#EA4335"
                  />
                </svg>
                解鎖 T-Pass — 使用學校 Google 帳號登入
              </button>
              <p className="text-xs font-medium text-muted-foreground">
                僅限 tschool.edu.tw 帳號
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
