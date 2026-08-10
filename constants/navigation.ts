import {
  Home,
  User,
  Building2,
  Bot,
  BookOpen,
  CalendarDays,
  Activity,
  Newspaper,
  Sparkles,
  Plane,
  BriefcaseBusiness,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "About",
    href: "/about",
    icon: User,
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "HSAKAA",
    href: "/hsakaa",
    icon: Bot,
  },
  {
    title: "Reading",
    href: "/reading",
    icon: BookOpen,
  },
  {
    title: "Learning",
    href: "/learning",
    icon: Newspaper,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    title: "Health",
    href: "/health",
    icon: Activity,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Sparkles,
  },
  {
    title: "Travel",
    href: "/travel",
    icon: Plane,
  },
  {
    title: "Career",
    href: "/career",
    icon: BriefcaseBusiness,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
];