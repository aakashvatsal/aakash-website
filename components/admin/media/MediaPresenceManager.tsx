"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Building2,
  CheckCircle2,
  Eye,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import {
  bootstrapMediaPresence,
  generateMediaPresenceStrategy,
  generateMediaVoiceProfile,
} from "@/lib/api/media";
import type {
  MediaPresenceOverview,
  MediaPresenceStrategy,
  MediaVoiceProfile,
} from "@/types/media";

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

export function MediaPresenceManager({
  initialOverview,
}: {
  initialOverview: MediaPresenceOverview;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");

  function run(action: () => Promise<unknown>, success: string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (value) {
        setError(
          value instanceof Error
            ? value.message
            : "HSAKAA Presence Engine action failed.",
        );
      }
    });
  }

  const { strategy, voice, context } = initialOverview;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] p-4 text-sm text-[#C6FF32]">
          {message}
        </div>
      ) : null}

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              <Sparkles className="h-4 w-4" /> Media V3.1
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
              Intelligence foundation
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              HSAKAA now builds Media from Aakash&apos;s wider Personal OS instead of
              treating content as an isolated island. Private-only details stay out of
              Media generation; internal-safe context can shape strategy without being
              published as fact.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={isPending}
              onClick={() =>
                run(
                  () => bootstrapMediaPresence({ force: true, notes }),
                  "Presence Strategy and Aakash Voice Profile regenerated.",
                )
              }
              className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black disabled:opacity-40"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Build / refresh both
            </button>
            <button
              disabled={isPending}
              onClick={() =>
                run(
                  () => generateMediaPresenceStrategy({ force: true, notes }),
                  "Presence Strategy regenerated.",
                )
              }
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/70 disabled:opacity-40"
            >
              Strategy only
            </button>
            <button
              disabled={isPending}
              onClick={() =>
                run(
                  () => generateMediaVoiceProfile({ force: true, notes }),
                  "Aakash Voice Profile regenerated.",
                )
              }
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/70 disabled:opacity-40"
            >
              Voice only
            </button>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional direction for this refresh — e.g. keep company content subtle, lean more into builder/operator thinking."
          className="mt-5 min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Captured days" value={context.coverage.capturedDays} />
        <Stat label="Context signals" value={context.coverage.totalItems} />
        <Stat label="Public-safe" value={context.coverage.publicSafe} />
        <Stat label="Internal-safe" value={context.coverage.internalSafe} />
        <Stat label="Needs review" value={context.coverage.needsReview} />
        <Stat label="Private-only" value={context.coverage.privateOnly} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#C6FF32]" />
              <h2 className="font-black text-white">What Media can see</h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-white/35">
              Coverage comes from HSAKAA Daily Context plus Companies, HSAKAA weekly
              intelligence and existing Media history.
            </p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/35">
            {context.windowDays} days
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <ContextList
            title="Public-safe evidence"
            note="May ground public content."
            items={context.publicSafePreview}
          />
          <ContextList
            title="Internal-safe context"
            note="May shape strategy, never exposed as fact by default."
            items={context.internalSafePreview}
          />
          <ContextList
            title="Needs review"
            note="Cannot become public fact until you approve it."
            items={context.needsReviewPreview}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {context.companies.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-white/5 bg-black/20 p-4"
            >
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Building2 className="h-4 w-4 text-[#C6FF32]" /> {company.name}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/40">
                {company.currentFocus ||
                  company.currentPriorities?.[0] ||
                  company.products?.join(", ") ||
                  "Company context available."}
              </p>
            </div>
          ))}
        </div>

        {context.coverage.missingSources.length ? (
          <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs text-amber-100/70">
            Context sources with no recent captured signal: {context.coverage.missingSources.join(", ")}.
            This does not mean the module is disconnected; it means HSAKAA Daily Context has no recent item from that source.
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <PresenceStrategyCard strategy={strategy} />
        <VoiceCard voice={voice} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#C6FF32]" />
          <h2 className="font-black text-white">Privacy + authenticity boundary</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Policy
            icon={<LockKeyhole className="h-4 w-4" />}
            title="Private-only stays private"
            text="Media receives counts, not private-only details."
          />
          <Policy
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Internal is not evidence"
            text="It can shape what HSAKAA thinks about, but cannot be quoted as public fact."
          />
          <Policy
            icon={<UserRound className="h-4 w-4" />}
            title="Aakash stays Aakash"
            text="Voice learning models mechanisms, not reusable catchphrases or an influencer persona."
          />
          <Policy
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Approval still matters"
            text="V3.1 changes intelligence, not the existing acceptance/scheduling/publishing boundaries."
          />
        </div>
      </section>
    </div>
  );
}

function PresenceStrategyCard({
  strategy,
}: {
  strategy: MediaPresenceStrategy | null;
}) {
  if (!strategy) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/40">
        No Presence Strategy yet. Use <strong className="text-white/70">Build / refresh both</strong> to create the first 30/90-day strategy.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-[#C6FF32]" />
        <h2 className="font-black text-white">Aakash Presence Strategy</h2>
        <span className="ml-auto text-xs text-white/25">v{strategy.version}</span>
      </div>
      <p className="mt-4 text-lg font-black leading-7 text-white">{strategy.northStar}</p>
      <p className="mt-2 text-sm leading-6 text-white/45">{strategy.positioning}</p>

      <div className="mt-5">
        <Label>Known for</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {strategy.knownFor.map((item) => (
            <span key={item} className="rounded-full border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] px-3 py-1 text-xs text-[#C6FF32]/80">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {strategy.platformRoles.map((role) => (
          <div key={role.platform} className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-sm font-black text-white">{platformLabels[role.platform] || role.platform}</div>
            <p className="mt-1 text-xs leading-5 text-white/45">{role.role}</p>
            <p className="mt-2 text-xs text-white/30">
              {role.minPostsPerWeek}–{role.maxPostsPerWeek}/week · preferred {role.preferredPostsPerWeek} · {role.allowSkipDays ? "skip days allowed" : "continuous cadence"}
            </p>
            <div className="mt-2 text-[11px] text-[#C6FF32]/60">{role.primaryFormats.join(" · ")}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <StringList title="30-day objectives" items={strategy.thirtyDayObjectives} />
        <StringList title="90-day objectives" items={strategy.ninetyDayObjectives} />
        <StringList title="Reputation goals" items={strategy.reputationGoals} />
        <StringList title="Never become" items={strategy.neverBecome} danger />
      </div>
    </section>
  );
}

function VoiceCard({ voice }: { voice: MediaVoiceProfile | null }) {
  if (!voice) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/40">
        No Aakash Voice Profile yet. The first profile starts as a hypothesis and gains confidence as approved Media history grows.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-[#C6FF32]" />
        <h2 className="font-black text-white">Aakash Voice</h2>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <div className="text-3xl font-black text-white">{Math.round(voice.confidence)}%</div>
        <div className="pb-1 text-xs text-white/30">confidence · {voice.sourceSampleCount} source samples</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/50">{voice.summary}</p>

      <div className="mt-5 space-y-3">
        <VoiceRow label="Rhythm" value={voice.sentenceRhythm} />
        <VoiceRow label="Vocabulary" value={voice.vocabulary} />
        <VoiceRow label="Humour" value={voice.humour} />
        <VoiceRow label="Profanity" value={voice.profanity} />
        <VoiceRow label="Technical depth" value={voice.technicalDepth} />
        <VoiceRow label="Emotional openness" value={voice.emotionalOpenness} />
        <VoiceRow label="Storytelling" value={voice.storytelling} />
      </div>

      <div className="mt-5 space-y-4">
        <StringList title="Do more" items={voice.doMore} />
        <StringList title="Do not" items={voice.doNot} danger />
        <StringList title="Authenticity checks" items={voice.authenticityChecks} />
      </div>
    </section>
  );
}

function ContextList({
  title,
  note,
  items,
}: {
  title: string;
  note: string;
  items: MediaPresenceOverview["context"]["publicSafePreview"];
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="text-sm font-black text-white">{title}</div>
      <div className="mt-1 text-xs text-white/30">{note}</div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div key={`${item.source}-${item.id}`} className="border-t border-white/5 pt-2 first:border-0 first:pt-0">
              <div className="text-xs font-bold text-white/65">{item.title}</div>
              <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/30">{item.summary}</div>
            </div>
          ))
        ) : (
          <div className="text-xs text-white/25">No recent items.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/30">{label}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-black uppercase tracking-[0.14em] text-white/30">{children}</div>;
}

function StringList({ title, items, danger = false }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <div>
      <Label>{title}</Label>
      <ul className="mt-2 space-y-2">
        {items.slice(0, 8).map((item) => (
          <li key={item} className={`rounded-xl border p-3 text-xs leading-5 ${danger ? "border-amber-300/10 bg-amber-300/[0.025] text-amber-100/60" : "border-white/5 bg-black/20 text-white/45"}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{label}</div>
      <div className="mt-1 text-xs leading-5 text-white/50">{value}</div>
    </div>
  );
}

function Policy({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <span className="text-[#C6FF32]">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-white/35">{text}</p>
    </div>
  );
}
