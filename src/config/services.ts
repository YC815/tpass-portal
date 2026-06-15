export type ServiceTone = "green" | "blue" | "orange" | "violet" | "rose";
export type UserRole = "student" | "teacher" | "all";

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
    id: "food",
    name: "線上點餐",
    url: "https://food.tschool.edu.tw",
    icon: "UtensilsCrossed",
    tone: "green",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "booking",
    name: "校園場地預約",
    url: "https://booking.tschool.edu.tw",
    icon: "CalendarCheck",
    tone: "blue",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "clubs",
    name: "社團簽到與管理",
    url: "https://clubs.tschool.edu.tw",
    icon: "Users",
    tone: "orange",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "announcements",
    name: "學生會即時公告",
    url: "https://sa.tschool.edu.tw",
    icon: "Megaphone",
    tone: "violet",
    roles: ["all"],
    enabled: true,
  },
  {
    id: "lost-found",
    name: "遺失物尋找",
    url: "https://lost.tschool.edu.tw",
    icon: "PackageSearch",
    tone: "rose",
    roles: ["all"],
    enabled: true,
  },
];
