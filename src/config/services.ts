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
    id: "survey",
    name: "問卷系統",
    url: "https://form.tschool.edu.tw",
    icon: "ClipboardList",
    tone: "violet",
    roles: ["all"],
    enabled: true,
  },
];
