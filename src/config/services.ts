// 門戶發射台的服務卡片。
// ⚠️ 網址一律 env 驅動，**絕不寫死網域**——寫死的話本機門戶會把人送去正式站，
// 本機根本測不了 SSO 互通（2026-07-13 踩過這個坑）。本機填 *.lvh.me:<port>，主機填正式網域。
import "server-only";

export type ServiceTone = "green" | "blue" | "orange" | "violet" | "rose";
export type UserRole = "student" | "teacher" | "all";

// 必填 env（deploy.sh 與 `tpass check env` 都會解析本陣列，缺 key 在 build 前就擋下）。
// 只列**已上線**服務的 URL。未上線的服務（如 vote）用「有沒有設 URL」當開關——
// 見下方 enabled；正式站不設就不會出現在大廳，不必為了讓 build 過而填一個死連結。
const REQUIRED = ["FORM_URL", "MSG_URL", "APPEALS_URL"] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[config/services] 缺少必填環境變數：${missing.join(", ")}（請檢查 .env.local）`,
  );
}

export interface Service {
  id: string;
  // 對齊 services.json / auth permissions claim 的服務 id——查該服務的 ban/warning
  // 狀態就是拿這把 key 去 session.permissions 裡找（見 lib/tpass-auth.ts 的 permOf）。
  serviceId: string;
  name: string;
  url: string;
  icon: string;
  tone: ServiceTone;
  roles: UserRole[];
  enabled: boolean;
}

export const services: Service[] = [
  {
    id: "survey",
    serviceId: "form",
    name: "問卷系統",
    url: process.env.FORM_URL!,
    icon: "ClipboardList",
    tone: "violet",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "messages",
    serviceId: "msg",
    name: "跨屆代傳",
    url: process.env.MSG_URL!,
    icon: "MessagesSquare",
    tone: "blue",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "appeals",
    serviceId: "appeals",
    name: "申訴系統",
    url: process.env.APPEALS_URL!,
    icon: "Gavel",
    tone: "rose",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "vote",
    serviceId: "vote",
    name: "T-Vote 選舉",
    // 未上線：VOTE_URL 沒設就整張卡不出現（大廳只列 enabled 的服務）。
    url: process.env.VOTE_URL ?? "",
    icon: "Vote",
    tone: "orange",
    roles: ["all"],
    enabled: Boolean(process.env.VOTE_URL),
  },
];
