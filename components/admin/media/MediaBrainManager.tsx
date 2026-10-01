import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  FlaskConical,
  Pin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  MediaGrowthOverview,
  MediaIntelligenceOverview,
  MediaLaunchOverview,
  MediaLearningOverview,
  MediaManualAnalyticsQueue,
  MediaPlanningOverview,
  MediaPresenceOsOverview,
  MediaPresenceOverview,
  MediaSocialPresenceOverview,
} from "@/types/media";

type Props = {
  presence: MediaPresenceOverview | null;
  planning: MediaPlanningOverview | null;
  learning: MediaLearningOverview | null;
  growth: MediaGrowthOverview | null;
  launch: MediaLaunchOverview | null;
  adaptation: MediaPresenceOsOverview | null;
  intelligence: MediaIntelligenceOverview | null;
  socialPresence: MediaSocialPresenceOverview | null;
  analyticsQueue: MediaManualAnalyticsQueue | null;
};

function number(value?: number | null) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(value || 0)));
}

function percent(value?: number | null) {
  return `${Math.max(0, Math.round(value || 0))}%`;
}

function pretty(value?: string | null) {
  return (value || "-").replaceAll("_", " ");
}

export function MediaBrainManager({
  presence,
  planning,
  learning,
  growth,
  launch,
  adaptation,
  intelligence,
  socialPresence,
  analyticsQueue,
}: Props) {
  const strategy = presence?.strategy;
  const voice = presence?.voice;
  const weekly = adaptation?.latest;
  const plan = planning?.latest;

  const positiveLearnings = (growth?.learnings ?? [])
    .filter((item) => item.direction === "positive")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
  const negativeLearnings = (growth?.learnings ?? [])
    .filter((item) => item.direction === "negative")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
  const activeExperiments = (growth?.experiments ?? [])
    .filter((item) => item.status === "planned" || item.status === "running")
    .slice(0, 8);
  const openArcs = (plan?.storyArcs ?? [])
    .filter((arc) => arc.status !== "completed")
    .slice(0, 10);
  const analyticsDue = (analyticsQueue?.items ?? []).filter(
    (item) =>
      item.fortyEightHours.state === "due" ||
      item.ninetySixHours.state === "due",
  );
  const pendingProfileActions = (socialPresence?.latestReview?.platformReviews ?? [])
    .flatMap((review) =>
      (review.profileManager?.actions ?? [])
        .filter((action) => action.action !== "wait" && action.action !== "keep_pinned")
        .map((action) => ({ platform: review.platform, ...action })),
    )
    .slice(0, 10);
  const pendingStrategyChanges = weekly?.strategyChangeCandidates ?? [];

  const captureRequests = (plan?.days ?? [])
    .flatMap((day) => {
      const story =
        day.instagramStory?.action === "post" && day.instagramStory.captureBrief
          ? [{
              key: `${day.date}:story`,
              date: day.date,
              platform: "Instagram Story",
              title: day.theme || "Daily story",
              instruction: day.instagramStory.captureBrief,
            }]
          : [];
      const executions = (day.executions ?? [])
        .filter((item) => item.action === "post")
        .map((item) => ({
          key: `${day.date}:${item.platform}`,
          date: day.date,
          platform: pretty(item.platform),
          title: item.title || item.formatIntent,
          instruction:
            item.productionNotes ||
            item.imageBrief?.sourceGuidance ||
            item.videoPack?.shotList?.[0] ||
            "Use the execution pack in the 7-Day Plan.",
        }));
      return [...story, ...executions];
    })
    .slice(0, 12);

  const topPerformance = (learning?.performance ?? [])
    .slice()
    .sort((a, b) => b.confidence - a.confidence || b.percentile - a.percentile)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              <Brain className="h-4 w-4" /> Current operating model
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
              {strategy?.northStar || "Presence strategy has not been generated yet."}
            </h2>
            {strategy?.positioning ? (
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/55">
                {strategy.positioning}
              </p>
            ) : null}
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-2">
            <Metric label="Launch phase" value={pretty(launch?.phase)} />
            <Metric label="Launch day" value={launch ? `Day ${launch.dayNumber}` : "-"} />
            <Metric label="Voice confidence" value={voice ? percent(voice.confidence) : "-"} />
            <Metric label="Weekly data confidence" value={weekly ? percent(weekly.dataConfidence) : "-"} />
          </div>
        </div>
        {strategy?.knownFor?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {strategy.knownFor.map((item) => (
              <span key={item} className="rounded-full border border-[#C6FF32]/15 bg-black/20 px-3 py-1.5 text-xs text-white/55">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <Stat icon={ScanSearch} label="Context captured" value={number(presence?.context.coverage.totalItems)} detail={`${presence?.context.coverage.capturedDays ?? 0} days in current context window`} />
        <Stat icon={ShieldCheck} label="Anti-repeat coverage" value={intelligence ? `${percent(intelligence.contentCoveragePercent)} / ${percent(intelligence.publicationCoveragePercent)}` : "-"} detail="content / publication memory coverage" />
        <Stat icon={BarChart3} label="Measured posts" value={number(growth?.publicationsMeasured)} detail={`${analyticsDue.length} analytics checkpoint${analyticsDue.length === 1 ? "" : "s"} due now`} />
        <Stat icon={Pin} label="Profile actions" value={number(pendingProfileActions.length)} detail={`${socialPresence?.activeRecommendations?.length ?? 0} network recommendations active`} />
      </section>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Panel icon={Compass} title="What HSAKAA keeps before writing" subtitle="Persistent context loaded before it chooses a topic or writes copy.">
          <BrainRow title="Presence strategy" value={strategy ? `v${strategy.version} · North Star, positioning, audiences, narratives, platform roles and company balance.` : "Not generated yet."} />
          <BrainRow title="Aakash voice" value={voice ? `${voice.summary} Confidence ${Math.round(voice.confidence)}% from ${voice.sourceSampleCount} source samples.` : "No active voice profile yet."} />
          <BrainRow title="Whole-OS context" value={presence ? `${presence.context.coverage.totalItems} sanitized signals across ${presence.context.coverage.capturedDays} captured days. People and normal Memory stay excluded.` : "Unavailable."} />
          <BrainRow title="Anti-repetition memory" value={intelligence ? `${intelligence.indexedContent} content items and ${intelligence.indexedPublications} publications indexed. Similarity blocks at ${Math.round(intelligence.policy.blockedSimilarity * 100)}%.` : "Unavailable."} />
          <BrainRow title="Measured performance" value={growth ? `${growth.publicationsMeasured} measured publications, ${growth.learnings.length} active growth learnings and ${growth.experiments.length} tracked experiments.` : "No measured history yet."} />
          <BrainRow title="Current weekly adaptation" value={weekly?.summary || "No weekly adaptation generated yet."} />
          <BrainRow title="Launch policy" value={launch ? `${pretty(launch.phase)}. Minimum ${launch.policy.minimumEvidenceBeforeConclusion} comparable samples before strong conclusions.` : "Launch state unavailable."} />
        </Panel>

        <Panel icon={Target} title="This week's strategy" subtitle="The temporary overlay HSAKAA is using without silently rewriting your permanent identity.">
          <ListBlock title="Focus this week" items={weekly?.focusThisWeek ?? []} empty="No weekly focus overlay yet." />
          <ListBlock title="Avoid this week" items={weekly?.avoidThisWeek ?? []} empty="No specific avoid signals yet." />
          <ListBlock title="Experiments" items={weekly?.experiments ?? []} empty="No weekly experiments generated yet." />
          <ListBlock title="Planning guidance" items={weekly?.planningGuidance ?? []} empty="No additional planning guidance yet." />
        </Panel>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Panel icon={CheckCircle2} title="What HSAKAA currently believes is working" subtitle="Evidence, not permanent rules. Higher-confidence signals rise to the top.">
          {positiveLearnings.length ? positiveLearnings.map((item) => (
            <Signal key={`${item.dimension}:${item.value}:${item.platform ?? "all"}`} tone="positive" title={`${pretty(item.dimension)} · ${item.value}`} meta={`${item.sampleSize} samples · ${Math.round(item.confidence)}% confidence · ${item.liftPercent >= 0 ? "+" : ""}${Math.round(item.liftPercent)}% lift`} body={item.recommendedAction || item.summary} />
          )) : <Empty>No positive multi-sample learning is strong enough yet.</Empty>}
          {topPerformance.length ? (
            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Recent performance mechanisms</p>
              <div className="mt-3 space-y-2">
                {topPerformance.map((item) => <div key={item._id ?? `${item.publicationId}-${item.period}`} className="rounded-xl border border-white/5 bg-black/20 p-3"><p className="text-xs font-bold text-white/70">{item.summary}</p><p className="mt-1 text-[11px] text-white/35">{Math.round(item.percentile)}th percentile · {Math.round(item.confidence)}% confidence · {pretty(item.identityPillar)}</p></div>)}
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel icon={AlertTriangle} title="What HSAKAA is reducing or has not proved" subtitle="This prevents one weak or lucky post from steering the whole account.">
          {negativeLearnings.length ? negativeLearnings.map((item) => (
            <Signal key={`${item.dimension}:${item.value}:${item.platform ?? "all"}`} tone="negative" title={`${pretty(item.dimension)} · ${item.value}`} meta={`${item.sampleSize} samples · ${Math.round(item.confidence)}% confidence · ${Math.round(item.liftPercent)}% lift`} body={item.recommendedAction || item.summary} />
          )) : <Empty>No negative multi-sample pattern is strong enough yet.</Empty>}
          {weekly?.risks?.length ? <ListBlock title="Current strategic risks" items={weekly.risks} empty="" /> : null}
        </Panel>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Panel icon={Sparkles} title="Open story arcs" subtitle="Ongoing chapters HSAKAA should advance instead of publishing isolated posts.">
          {openArcs.length ? openArcs.map((arc) => (
            <div key={arc.key} className="rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-white">{arc.title}</p><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase text-white/35">{arc.status}</span></div>
              <p className="mt-2 text-xs leading-5 text-white/45">{arc.currentChapter || arc.purpose}</p>
              {arc.currentTension ? <p className="mt-2 text-xs text-amber-200/70">Tension: {arc.currentTension}</p> : null}
              {arc.unresolvedQuestion ? <p className="mt-1 text-xs text-white/40">Open question: {arc.unresolvedQuestion}</p> : null}
              {arc.nextNarrativeOpportunity ? <p className="mt-2 text-xs text-[#C6FF32]/70">Next: {arc.nextNarrativeOpportunity}</p> : null}
            </div>
          )) : <Empty>No open story arcs in the current seven-day plan.</Empty>}
        </Panel>

        <Panel icon={FlaskConical} title="Experiments currently running" subtitle="HSAKAA should learn mechanisms without locking into an early winner.">
          {activeExperiments.length ? activeExperiments.map((item) => (
            <div key={item._id} className="rounded-xl border border-white/5 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-white">{item.title}</p><span className="text-[10px] font-black uppercase text-[#C6FF32]">{item.status}</span></div><p className="mt-2 text-xs leading-5 text-white/45">{item.hypothesis}</p><p className="mt-2 text-[11px] text-white/30">Test: {item.variable} · control: {item.control} · variant: {item.variant}</p></div>
          )) : <Empty>No formal growth experiment is running right now.</Empty>}
        </Panel>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Panel icon={Eye} title="What HSAKAA wants you to capture next" subtitle="The real-world inputs needed to keep content grounded instead of manufactured.">
          {captureRequests.length ? captureRequests.map((item) => (
            <div key={item.key} className="rounded-xl border border-white/5 bg-black/20 p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]">{item.date} · {item.platform}</p><p className="mt-1 font-bold text-white">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/45">{item.instruction}</p></div>
          )) : <Empty>No capture request exists in the current plan.</Empty>}
        </Panel>

        <Panel icon={Pin} title="Pending manager actions" subtitle="Things HSAKAA can recommend but should not silently do for you.">
          {analyticsDue.length ? <Action title={`${analyticsDue.length} analytics checkpoint${analyticsDue.length === 1 ? "" : "s"} due`} href="/admin/media/analytics" detail="Enter the 48h/96h numbers so future planning learns from real outcomes." /> : null}
          {pendingProfileActions.map((action) => <Action key={`${action.platform}:${action.publicationId}:${action.action}`} title={`${pretty(action.action)} · ${action.title}`} href="/admin/media/network" detail={`${pretty(action.platform)} · ${action.reason}`} />)}
          {pendingStrategyChanges.map((item) => <Action key={`${item.field}:${item.proposedChange}`} title={`Strategy change candidate · ${item.field}`} href="/admin/media/presence" detail={`${item.proposedChange} ${item.reason}`} />)}
          {!analyticsDue.length && !pendingProfileActions.length && !pendingStrategyChanges.length ? <Empty>No manual manager action is currently waiting.</Empty> : null}
        </Panel>
      </div>

      <Panel icon={ShieldCheck} title="Identity and strategy guardrails" subtitle="Rules HSAKAA should protect even when performance data starts pulling in another direction.">
        <div className="grid gap-5 xl:grid-cols-3">
          <ListBlock title="Never become" items={strategy?.neverBecome ?? []} empty="No explicit guardrails yet." />
          <ListBlock title="Privacy rules" items={strategy?.privacyRules ?? []} empty="No additional privacy rules stored." />
          <ListBlock title="30-day objectives" items={strategy?.thirtyDayObjectives ?? []} empty="No 30-day objectives stored." />
        </div>
      </Panel>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-white/25">Inspection rule</p><p className="mt-1 text-sm text-white/55">Media Brain explains the state HSAKAA is actually using. It does not create a second strategy or rewrite the plan.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/media/plan" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-xs font-black text-black">Inspect planned posts</Link><Link href="/admin/media/analytics" className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-white/60">Enter analytics</Link><Link href="/admin/media/network" className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-white/60">Profile manager</Link></div></div>
      </section>
    </div>
  );
}

function Panel({ icon: Icon, title, subtitle, children }: { icon: typeof Brain; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5 sm:p-6"><div className="flex items-start gap-3"><div className="rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] p-2 text-[#C6FF32]"><Icon className="h-4 w-4" /></div><div><h2 className="font-black text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-white/35">{subtitle}</p></div></div><div className="mt-5 space-y-3">{children}</div></section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/5 bg-black/20 p-3"><p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/25">{label}</p><p className="mt-1 text-sm font-black text-white/70">{value}</p></div>; }
function Stat({ icon: Icon, label, value, detail }: { icon: typeof Brain; label: string; value: string; detail: string }) { return <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-4"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/30"><Icon className="h-4 w-4 text-[#C6FF32]" />{label}</div><p className="mt-3 text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs leading-5 text-white/35">{detail}</p></div>; }
function BrainRow({ title, value }: { title: string; value: string }) { return <div className="rounded-xl border border-white/5 bg-black/20 p-4"><p className="text-xs font-black text-white/70">{title}</p><p className="mt-1 text-xs leading-5 text-white/40">{value}</p></div>; }
function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) { return <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{title}</p>{items.length ? <ul className="mt-2 space-y-2">{items.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2 text-xs leading-5 text-white/45"><span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#C6FF32]" />{item}</li>)}</ul> : empty ? <p className="mt-2 text-xs text-white/30">{empty}</p> : null}</div>; }
function Signal({ tone, title, meta, body }: { tone: "positive" | "negative"; title: string; meta: string; body: string }) { return <div className={`rounded-xl border p-4 ${tone === "positive" ? "border-[#C6FF32]/10 bg-[#C6FF32]/[0.02]" : "border-amber-300/10 bg-amber-300/[0.02]"}`}><p className="font-bold text-white">{title}</p><p className="mt-1 text-[11px] text-white/30">{meta}</p><p className="mt-2 text-xs leading-5 text-white/45">{body}</p></div>; }
function Action({ title, detail, href }: { title: string; detail: string; href: string }) { return <Link href={href} className="block rounded-xl border border-white/5 bg-black/20 p-4 transition hover:border-[#C6FF32]/20"><p className="font-bold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-white/40">{detail}</p></Link>; }
function Empty({ children }: { children: React.ReactNode }) { return <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/30">{children}</div>; }
