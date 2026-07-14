// 門戶發射台的服務卡片。
// ⚠️ 網址一律 env 驅動，**絕不寫死網域**——寫死的話本機門戶會把人送去正式站，
// 本機根本測不了 SSO 互通（2026-07-13 踩過這個坑）。本機填 *.lvh.me:<port>，主機填正式網域。
import "server-only";

export type ServiceTone = "green" | "blue" | "orange" | "violet" | "rose";
export type UserRole = "student" | "teacher" | "all";

// 必填 env（deploy.sh 與 `tpass check env` 都會解析本陣列，缺 key 在 build 前就擋下）。
const REQUIRED = ["FORM_URL", "MSG_URL", "APPEALS_URL"] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[config/services] 缺少必填環境變數：${missing.join(", ")}（請檢查 .env.local）`,
  );
}

export interface Service {
  id: string;
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
    name: "問卷系統",
    url: process.env.FORM_URL!,
    icon: "ClipboardList",
    tone: "violet",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "messages",
    name: "跨屆代傳",
    url: process.env.MSG_URL!,
    icon: "MessagesSquare",
    tone: "blue",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "appeals",
    name: "申訴系統",
    url: process.env.APPEALS_URL!,
    icon: "Gavel",
    tone: "rose",
    roles: ["all"],
    enabled: true,
  },
];
