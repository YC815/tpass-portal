// 門戶發射台的服務卡片，全部由 tpass-registry 的 services.json 派生。
// ⚠️ 這裡不再有硬編碼的服務清單，也不再有 <SVC>_URL 環境變數——
// 加一個服務 = 對 tpass-registry 開一個 PR，portal 這邊零改動、零新 env。
// 網址由 subdomain + domains + port 推導（見 lib/registry.ts 的 urlFor），
// 所以「絕不寫死網域」這條鐵則從此不必靠人記得遵守（2026-07-13 踩過那個坑）。
import "server-only";
import { lobbyServices, urlFor, type RegistryService } from "@/lib/registry";
import { ICON_MAP, ICON_NAMES } from "@/config/icons";
import { portalConfig } from "@/config/portal";

export type ServiceTone = "green" | "blue" | "orange" | "violet" | "rose";
export type UserRole = "student" | "teacher" | "all";

export interface Service {
  // ＝ services.json 的服務 id ＝ auth permissions claim 的 key——查該服務的
  // ban/warning 狀態就是拿它去 session.permissions 裡找（見 lib/tpass-auth.ts 的 permOf）。
  id: string;
  name: string;
  url: string;
  icon: string;
  tone: ServiceTone;
  roles: UserRole[];
}

// tone / roles 的合法值在 registry 那邊已由 validate.mjs（PR CI）擋過，這裡只做型別收斂。
// 圖示是唯一 registry 驗不到的欄位（它不認識 lucide），所以在這裡擋——
// 不認得就直接炸，不要靜默換一個圖示讓人上線後才發現卡片長錯。
function toCard(s: RegistryService): Service {
  if (!ICON_MAP[s.portal!.icon]) {
    throw new Error(
      `[config/services] 服務「${s.id}」的 portal.icon =「${s.portal!.icon}」不在圖示白名單裡。\n` +
        `  要嘛改用現有的：${ICON_NAMES.join(", ")}\n` +
        `  要嘛在 src/config/icons.ts 的 ICON_MAP 加一行（lucide-react 的 PascalCase 名稱）。`,
    );
  }
  return {
    id: s.id,
    name: s.portal!.label,
    url: urlFor(s, portalConfig.selfUrl),
    icon: s.portal!.icon,
    tone: s.portal!.tone as ServiceTone,
    roles: s.portal!.roles as UserRole[],
  };
}

export const services: Service[] = lobbyServices().map(toCard);
