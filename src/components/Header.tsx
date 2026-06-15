"use client";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b-2 border-foreground/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <span className="font-mono text-lg font-extrabold tracking-tight text-foreground">
          T<span className="text-primary">-</span>Pass
        </span>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="rounded-md border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              已登入
            </span>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              登出
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            尚未登入
          </span>
        )}
      </div>
    </header>
  );
}
