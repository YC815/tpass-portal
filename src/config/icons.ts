// 大廳卡片可用的圖示白名單。
// 為什麼是白名單而不是「按名字動態載入任何 lucide 圖示」：動態版只能在 client 端
// useEffect 之後才拿到圖示，大廳每次進來都會先閃一排空卡。白名單能 SSR，代價是
// registry 想用清單外的圖示時要在這裡多加一行——那一行不會被漏掉，因為
// config/services.ts 在啟動時就會對不認得的名字直接丟錯（不靜默 fallback）。
import {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  PackageSearch,
  ClipboardList,
  MessagesSquare,
  Gavel,
  Vote,
  Search,
  BookOpen,
  Calendar,
  FileText,
  Ticket,
  Trophy,
  Wrench,
  Scale,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Megaphone,
  PackageSearch,
  ClipboardList,
  MessagesSquare,
  Gavel,
  Vote,
  Search,
  BookOpen,
  Calendar,
  FileText,
  Ticket,
  Trophy,
  Wrench,
  Scale,
};

export const ICON_NAMES = Object.keys(ICON_MAP);
