import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Dumbbell,
  Footprints,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { JournalEntry } from "@/types/journal";
import { MoodBadge } from "./MoodBadge";

type JournalDetailsProps = {
  entry: JournalEntry;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function metadata(entry: JournalEntry) {
  return entry.metadata && typeof entry.metadata === "object" ? entry.metadata : {};
}

export function JournalDetails({ entry }: JournalDetailsProps) {
  const meta = metadata(entry);
  const isPrivateDaily = meta.dailySynthesis === true;
  const isPublicDaily = meta.dailyPublicDerivative === true;
  const approvalStatus = typeof meta.approvalStatus === "string" ? meta.approvalStatus : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                <CalendarDays className="h-4 w-4" /> {formatDate(entry.date)}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/50">
                {formatLabel(entry.type)}
              </span>
              <MoodBadge mood={entry.mood} score={entry.moodScore} />
              {entry.visibility === "private" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                  <LockKeyhole className="h-3.5 w-3.5" /> Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-xs font-bold text-[#C6FF32]">
                  {entry.isPublished ? "Published" : "Public draft"}
                </span>
              )}
              {(isPrivateDaily || isPublicDaily) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" /> HSAKAA {isPrivateDaily ? "private journal" : "public-safe journal"}
                </span>
              )}
              {approvalStatus && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/55">
                  <ShieldCheck className="h-3.5 w-3.5" /> {formatLabel(approvalStatus)}
                </span>
              )}
            </div>

            {entry.highlight ? (
              <blockquote className="mt-6 border-l-2 border-[#C6FF32] pl-4 text-base italic leading-7 text-white/70">
                {entry.highlight}
              </blockquote>
            ) : null}
          </div>

          <Link
            href={`/admin/journal/${entry._id}/edit`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-white/75 hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
          >
            <Pencil className="h-4 w-4" /> Edit journal
          </Link>
        </div>

        {entry.content ? (
          <div className="mt-8 whitespace-pre-wrap text-[15px] leading-8 text-white/75">
            {entry.content}
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <StringSection title="Wins" values={entry.wins} />
        <StringSection title="Lessons" values={entry.lessons} />
        <StringSection title="Decisions" values={entry.decisions} />
        <StringSection title="Ideas" values={entry.ideas} />
        <StringSection title="Challenges" values={entry.challenges} />
        <StringSection title="Gratitude" values={entry.gratitude} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {entry.workout?.completed || entry.workout?.title || entry.workout?.type ? (
          <MetricCard
            icon={Dumbbell}
            label="Workout"
            value={entry.workout.title || (entry.workout.type ? formatLabel(entry.workout.type) : "Completed")}
            detail={entry.workout.durationMinutes ? `${entry.workout.durationMinutes} min` : undefined}
          />
        ) : null}
        {entry.reading?.completed || entry.reading?.title ? (
          <MetricCard
            icon={BookOpen}
            label="Reading"
            value={entry.reading.title || "Reading activity"}
            detail={entry.reading.progressPercentage !== undefined ? `${entry.reading.progressPercentage}% progress` : entry.reading.author}
          />
        ) : null}
        {entry.sleep?.durationHours !== undefined ? (
          <MetricCard
            icon={LockKeyhole}
            label="Sleep"
            value={`${entry.sleep.durationHours} h`}
            detail={entry.sleep.recoveryScore !== undefined ? `Recovery ${entry.sleep.recoveryScore}` : undefined}
          />
        ) : null}
        {entry.steps > 0 ? (
          <MetricCard icon={Footprints} label="Steps" value={new Intl.NumberFormat("en-IN").format(entry.steps)} />
        ) : null}
      </section>

      {entry.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/45">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StringSection({ title, values }: { title: string; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <section className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/45">{title}</h2>
      <ul className="mt-4 space-y-3">
        {values.map((value, index) => (
          <li key={`${value}-${index}`} className="flex gap-3 text-sm leading-6 text-white/70">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF32]" />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof BookOpen; label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/35">
        <Icon className="h-4 w-4 text-[#C6FF32]" /> {label}
      </div>
      <p className="mt-3 text-base font-black text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs text-white/45">{detail}</p> : null}
    </div>
  );
}
