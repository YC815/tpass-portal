// 服務註冊表讀取器。真相住在並排的 tpass-registry repo（public）的 services.json——
// 加一個服務 = 對那個 repo 開一個 PR，portal 不必改一行程式碼。
//
// 為什麼是讀檔而不是打 API：註冊表是「部署時就決定好」的靜態事實，
// 讓大廳在 runtime 依賴另一個服務活著，只是把一個 git merge 換成一個故障點。
import "server-only";
import { readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export interface RegistryPortalCard {
  label: string;
  icon: string;
  tone: string;
  roles: string[];
}

export interface RegistryService {
  id: string;
  name: string;
  dir: string;
  subdomain: string;
  port: number;
  enabled: boolean;
  deployed: boolean;
  portal?: RegistryPortalCard;
}

export interface Registry {
  issuer: string;
  domains: { dev: string; prod: string };
  services: RegistryService[];
}

// 佈局：~/tpass/{tpass-registry,tpass-portal,…}，本機與主機同構，所以上一層一定找得到。
// TPASS_REGISTRY_PATH 是逃生門（CI、非標準 checkout）。
// 這裡與下面的 readFileSync 都要 turbopackIgnore：路徑不是靜態的，少標任何一處，
// Turbopack 的檔案追蹤就會把整個專案當成需要打包的資產，build 時噴
// 「the whole project was traced unintentionally」警告。
function locate(): string {
  const override = process.env.TPASS_REGISTRY_PATH;
  if (override) return isAbsolute(override) ? override : resolve(/* turbopackIgnore: true */ process.cwd(), override);
  return join(/* turbopackIgnore: true */ process.cwd(), "..", "tpass-registry", "services.json");
}

function load(): Registry {
  const file = locate();
  try {
    return JSON.parse(readFileSync(/* turbopackIgnore: true */ file, "utf8")) as Registry;
  } catch (e) {
    throw new Error(
      `[lib/registry] 讀不到服務註冊表：${file}\n` +
        `  註冊表是並排的 public repo，在 tpass-portal 的上一層 clone 一次：\n` +
        `    git clone https://github.com/YC815/tpass-registry.git\n` +
        `  或用 TPASS_REGISTRY_PATH 指到 services.json 的實際位置。\n` +
        `  原始錯誤：${(e as Error).message}`,
    );
  }
}

export const registry = load();

// 正式站與本機的差別只有網域與要不要帶 port——由自己的 SELF_URL 判斷身在何處，
// 不新增 env、也不靠 NODE_ENV（本機 production smoke 會判錯）。
export function urlFor(service: RegistryService, selfUrl: string): string {
  const host = new URL(selfUrl).hostname;
  const prod = registry.domains.prod;
  const isProd = host === prod || host.endsWith("." + prod);
  return isProd
    ? `https://${service.subdomain}.${prod}`
    : `https://${service.subdomain}.${registry.domains.dev}:${service.port}`;
}

// 會出現在大廳的服務：啟用中、已上線、且自己登記了卡片資訊。
export function lobbyServices(): RegistryService[] {
  return registry.services.filter((s) => s.enabled && s.deployed && s.portal);
}
