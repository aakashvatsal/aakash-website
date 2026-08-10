import Link from "next/link";
import {
  ArrowUpRight,
  Brain,
  FlaskConical,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const actions = [
  {
    title: "Add person",
    description:
      "Create a person HSAKAA can recognise and associate with personal memories.",
    href: "/admin/hsakaa/people/new",
    icon: UserPlus,
  },
  {
    title: "Add memory",
    description:
      "Store a global or person-specific memory for HSAKAA.",
    href: "/admin/hsakaa/memory/new",
    icon: Brain,
  },
  {
    title: "Open playground",
    description:
      "Test HSAKAA responses and inspect the memories used for context.",
    href: "/admin/hsakaa/playground",
    icon: FlaskConical,
  },
  {
    title: "Verification",
    description:
      "Review identity verification and person access activity.",
    href: "/admin/hsakaa/verification",
    icon: ShieldCheck,
  },
];

export function HsakaaQuickActions() {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
          Quick actions
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
          Manage HSAKAA
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[24px] border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#C6FF32]/30 hover:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/55 transition group-hover:border-[#C6FF32]/20 group-hover:text-[#C6FF32]">
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-white/20 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#C6FF32]" />
              </div>

              <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}