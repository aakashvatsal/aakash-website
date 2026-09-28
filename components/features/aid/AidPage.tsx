import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HandHeart,
  LockKeyhole,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const principles = [
  {
    icon: MessageCircle,
    title: "Start with the situation",
    body: "There is no separate application form. Talk to HSAKAA normally and explain what happened, what you need and when you need it.",
  },
  {
    icon: SearchCheck,
    title: "Verify what matters",
    body: "HSAKAA asks for the next fact, clarification or evidence needed to understand the request. It does not make you repeat the same story.",
  },
  {
    icon: UserCheck,
    title: "A human decides",
    body: "HSAKAA can assess, organize and surface inconsistencies, but every approval, amount and payment decision is human-reviewed.",
  },
];

const mayNeed = [
  "What happened and what financial help would change",
  "The amount you need and when you need it",
  "A document, image or PDF that supports the request",
  "Contact details once the case is ready for review",
  "UPI or bank details only when the case is sufficiently developed",
];

const whatWeAreDoing = [
  {
    title: "One conversation",
    body: "You do not have to learn a form or choose the right category. Start inside the normal HSAKAA chat and explain the situation in your own words.",
  },
  {
    title: "Evidence before assumption",
    body: "The goal is to understand what can be verified, what is still missing and whether the request is internally consistent before it reaches a human decision.",
  },
  {
    title: "Small, accountable pool",
    body: "HSAKAA Aid begins with ₹30,000 allocated each month. Starting small makes it possible to learn how requests arrive, where verification breaks and how the process should improve.",
  },
  {
    title: "Learn before defining causes",
    body: "There is no public list of causes yet. Real applications will show where help is actually needed. Internal cause tags are used for learning, not as eligibility rules.",
  },
];

export function AidPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030608] text-white">
      <section className="relative border-b border-white/[0.06] py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.05] blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <Container>
          <div className="relative grid gap-12 lg:grid-cols-[1fr_0.58fr] lg:items-end">
            <div>
              <Eyebrow>HSAKAA Aid</Eyebrow>

              <DisplayTitle className="mt-6 max-w-5xl">
                Help when money is the blocker.
              </DisplayTitle>

              <BodyText className="mt-8 max-w-3xl">
                HSAKAA Aid is an experiment in making small financial assistance
                easier to ask for, easier to verify and more accountable to
                decide. It starts on October 1, 2026 with ₹30,000 allocated each
                month. There is no predefined cause list. If financial support
                could genuinely help your situation, explain it in the normal
                HSAKAA chat.
              </BodyText>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/hsakaa"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C6FF32] px-6 py-3 text-sm font-black text-[#030608] transition hover:scale-[1.02]"
                >
                  Talk to HSAKAA
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/50">
                  <ShieldCheck className="h-4 w-4 text-[#C6FF32]" />
                  Human-reviewed decisions
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.08]">
              <div className="bg-[#030608]/95 p-6">
                <p className="text-4xl font-black tracking-[-0.05em] text-[#C6FF32]">
                  ₹30K
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.17em] text-white/30">
                  Monthly allocation
                </p>
              </div>

              <div className="bg-[#030608]/95 p-6">
                <p className="text-4xl font-black tracking-[-0.05em] text-white">
                  24h
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.17em] text-white/30">
                  Review target after contact capture
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <Eyebrow>Why I started it</Eyebrow>
              <h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.05em] md:text-5xl">
                Asking for help should not depend on finding the perfect form.
              </h2>
            </div>

            <div className="space-y-6 text-base leading-8 text-white/52">
              <p>
                A lot of financial help starts with friction. Someone has to
                find the right organization, understand whether their situation
                fits a category, repeat the same story and collect documents
                before anyone has even understood the problem.
              </p>
              <p>
                I wanted to test a simpler model. Start with a conversation.
                Let HSAKAA understand the situation, ask only for what is needed
                next, compare evidence with the claims being made and prepare a
                clear case for human review.
              </p>
              <p>
                This is not meant to automate compassion or outsource a final
                decision to AI. It is meant to reduce avoidable friction while
                keeping verification, accountability and human judgment in the
                loop.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] py-20 md:py-28">
        <Container>
          <div className="mb-10 max-w-3xl">
            <Eyebrow>What we are doing</Eyebrow>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] md:text-5xl">
              Start small. Verify carefully. Learn from real requests.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {whatWeAreDoing.map((item, index) => (
              <SpotlightCard
                key={item.title}
                className="rounded-[30px] border border-white/[0.08] bg-white/[0.018] p-7 md:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C6FF32]/10 text-xs font-black text-[#C6FF32]">
                    0{index + 1}
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-white/20" />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/48">
                  {item.body}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <SpotlightCard
                  key={item.title}
                  className="rounded-[30px] border border-white/[0.08] bg-white/[0.018] p-7 md:p-8"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-2xl font-black tracking-[-0.04em]">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/48">
                    {item.body}
                  </p>
                </SpotlightCard>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] py-20 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Eyebrow>No fixed causes yet</Eyebrow>
              <h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.05em] md:text-5xl">
                The situation comes first. The category can come later.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/48">
                HSAKAA Aid is deliberately not launching with a public list of
                approved causes. I do not want a genuine request to be excluded
                because it does not fit a label we invented before seeing real
                applications. Internally, cases can be tagged to learn where
                requests are coming from, but those tags are not eligibility
                rules.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/[0.08] bg-white/[0.018] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <HandHeart className="h-5 w-5 text-[#C6FF32]" />
                <p className="text-sm font-black uppercase tracking-[0.16em] text-white/55">
                  What HSAKAA may need to verify
                </p>
              </div>

              <div className="mt-7 space-y-3">
                {mayNeed.map((item, index) => (
                  <div
                    key={item}
                    className="flex gap-4 rounded-2xl border border-white/[0.07] bg-[#030608]/55 p-4"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C6FF32]/10 text-xs font-black text-[#C6FF32]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-6 text-white/58">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <SpotlightCard className="rounded-[32px] border border-white/[0.08] bg-white/[0.018] p-8 md:p-10">
              <LockKeyhole className="h-6 w-6 text-[#C6FF32]" />
              <h2 className="mt-6 text-3xl font-black tracking-[-0.045em]">
                Aid information stays separate.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/48">
                Contact details, payment details, evidence and Aid conversation
                data are handled separately from normal HSAKAA Memory. Sensitive
                Aid data is encrypted at rest and is not used as ordinary
                personal-memory context.
              </p>
            </SpotlightCard>

            <SpotlightCard className="rounded-[32px] border border-[#C6FF32]/18 bg-[#C6FF32]/[0.035] p-8 md:p-10">
              <Clock3 className="h-6 w-6 text-[#C6FF32]" />
              <h2 className="mt-6 text-3xl font-black tracking-[-0.045em]">
                Start by talking, not filling a form.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/52">
                Open HSAKAA and explain what happened in your own words. If the
                conversation becomes a request for financial assistance, HSAKAA
                will ask only for the next information or evidence needed to
                prepare it for human review.
              </p>

              <Link
                href="/hsakaa"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#C6FF32]"
              >
                Start a conversation
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SpotlightCard>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.06] py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <FileCheck2 className="mx-auto h-6 w-6 text-[#C6FF32]" />
            <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-5xl">
              This will improve as we learn.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/48">
              The first version of HSAKAA Aid is intentionally simple. Real
              cases will show what needs better verification, where people get
              stuck, which requests are common and whether dedicated causes
              should exist later. The system should become more useful because
              of what we learn, not because we guessed the categories in
              advance.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
