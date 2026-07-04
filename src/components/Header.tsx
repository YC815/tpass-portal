// 頂部導覽列。Server Component：登入/登出都是純連結與表單，不需 client 互動。
interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  loginUrl: string;
  logoutUrl: string;
}

export function Header({ isLoggedIn, userName, loginUrl, logoutUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b-2 border-foreground/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <span className="font-mono text-lg font-extrabold tracking-tight text-foreground">
          T<span className="text-primary">-</span>Pass
        </span>

        {isLoggedIn ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="max-w-[40vw] truncate rounded-md border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-foreground sm:max-w-none">
              {userName ?? "已登入"}
            </span>
            {/* 登出：POST 到 auth，清掉頂層 cookie（同網域生態系一起登出）。 */}
            <form method="post" action={logoutUrl}>
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                登出
              </button>
            </form>
          </div>
        ) : (
          <a
            href={loginUrl}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            登入
          </a>
        )}
      </div>
    </header>
  );
}
