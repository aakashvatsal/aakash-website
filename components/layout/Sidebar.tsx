import Link from "next/link";
import {
  Home,
  User,
  Building2,
  Bot,
  BookOpen,
  Calendar,
  Dumbbell,
  MessageSquareText,
  Mail,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: User },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "HSAKAA AI", href: "/hsakaa", icon: Bot },
  { label: "Reading", href: "/reading", icon: BookOpen },
  { label: "Learning", href: "/learning", icon: MessageSquareText },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Health", href: "/health", icon: Dumbbell },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[260px] border-r border-white/10 bg-[#050608] p-6 lg:flex lg:flex-col lg:justify-between">
      <div>
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#C6FF32] text-lg font-black text-[#030608]">
            AV
          </div>
          <div>
            <p className="font-bold text-white">Aakash Vatsal</p>
            <p className="text-xs text-white/45">Personal OS</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 text-white/40 transition group-hover:text-[#C6FF32]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">Talk to HSAKAA</p>
            <p className="text-xs text-white/45">AI version of Aakash</p>
          </div>
        </div>

        <Link
          href="/hsakaa"
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-[#030608]"
        >
          Start Chat
        </Link>

        <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
          <span>LinkedIn</span>
          <span>Instagram</span>
          <Mail className="h-4 w-4" />
        </div>
      </div>
    </aside>
  );
}