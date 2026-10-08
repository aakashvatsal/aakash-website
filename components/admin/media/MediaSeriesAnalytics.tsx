"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  changeMediaSeriesStatus,
  designMediaSeries,
  suggestMediaSeries,
  createMediaSeries,
  reviewMediaSeries,
  type MediaSeriesDesign,
  type NewMediaSeriesPitch,
  type MediaSeriesOverview,
  type MediaSeriesRecommendation,
} from "@/lib/api/media";
import type { MediaPlanningOverview, MediaCreatorQuotaCounts, MediaCreatorQuotaResult } from "@/types/media";

type Series = MediaSeriesOverview["groups"][number];
type Quota = MediaPlanningOverview["creatorQuota"];
const required: Array<{key: keyof MediaCreatorQuotaCounts; label:string}> = [
  {key:"instagramReels",label:"Instagram Reels"},
  {key:"instagramCarousels",label:"Instagram carousels"},
  {key:"youtubeLong",label:"YouTube long videos"},
  {key:"youtubeShorts",label:"YouTube Shorts"},
  {key:"linkedin",label:"LinkedIn"},
  {key:"x",label:"X"},
];

function QuotaPanel({ heading, quota }: { heading:string; quota?: MediaCreatorQuotaResult }) {
  return <div className="rounded-xl border p-4 space-y-2">
    <h3 className="font-semibold">{heading}</h3>
    {quota ? <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">{required.map(item => {
      const actual = quota.totals[item.key];
      const min = quota.minimums[item.key];
      return <div key={item.key} className="rounded-lg border p-3 text-xs">
        <div className="opacity-70">{item.label}</div>
        <div className={actual >= min ? "font-semibold" : "font-semibold text-amber-500"}>{actual} / {min}</div>
        {quota.deficits[item.key] > 0 && <div>{quota.deficits[item.key]} missing</div>}
      </div>;
    })}</div> : <p className="text-sm text-muted-foreground">Publication audit unavailable; cannot claim the target is met.</p>}
  </div>;
}

export function MediaSeriesAnalytics({ data, recommendations = [], quota }: {
  data: MediaSeriesOverview;
  recommendations?: MediaSeriesRecommendation[];
  quota?: Quota;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [newSeries, setNewSeries] = useState<NewMediaSeriesPitch>({name: '', angle: '', channels: ['instagram','youtube'], audience: ''});
  const [newDesign, setNewDesign] = useState<MediaSeriesDesign | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

  async function suggestNewSeries() {
    setBusy('suggest'); setFeedback(''); setNewDesign(null);
    try { const suggestion = await suggestMediaSeries(newSeries.angle);
      setNewSeries(suggestion.pitch); setNewDesign(suggestion.review); }
    catch(error) { setFeedback(error instanceof Error ? error.message : 'Could not suggest a series'); }
    finally { setBusy(null); }
  }
  async function reviewNewSeries() {
    setBusy('design'); setFeedback(''); setNewDesign(null);
    try { setNewDesign(await designMediaSeries(newSeries)); }
    catch(error) { setFeedback(error instanceof Error ? error.message : 'Could not review this series'); }
    finally { setBusy(null); }
  }
  async function saveNewSeries() {
    setBusy('create'); setFeedback('');
    try {
      const saved = await createMediaSeries({ ...newSeries, design: newDesign ?? undefined });
      setFeedback(`${saved.name} saved as PAUSED. Activate after pausing an existing series if all six slots are occupied.`);
      setNewSeries({name:'',angle:'',audience:'',channels:['instagram','youtube']});
      setNewDesign(null); setShowCreator(false); router.refresh();
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Could not create series'); }
    finally { setBusy(null); }
  }
  async function changeStatus(series: Series) {
    const next = series.status === "active" ? "paused" : "active";
    setBusy(series.key);
    setFeedback("");
    try {
      await changeMediaSeriesStatus(series.key, next, `Admin analytics action: ${next}`);
      router.refresh();
      setFeedback(`${series.name} set to ${next}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Series update failed");
    } finally { setBusy(null); }
  }

  async function runReview() {
    setBusy("review"); setFeedback("");
    try {
      const result = await reviewMediaSeries(true);
      setFeedback(result.applied && result.proposed
        ? `Retired ${result.proposed.retire} and activated ${result.proposed.activate}.`
        : result.reason);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Series review failed");
    } finally { setBusy(null); }
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1"><h2 className="text-xl font-semibold">Series performance</h2>
        <p className="text-sm text-muted-foreground">{data.activeCount} / {data.activeLimit} active series · {data.periodDays}-day window · {data.untaggedPublished} untagged published items</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => setShowCreator(v => !v)} className="rounded-lg border px-3 py-2 text-sm">{showCreator ? 'Close series creator' : 'New series + AI review'}</button>
        <button type="button" disabled={busy !== null} onClick={runReview} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Run evidence-based review</button>
      </div>
    </div>
    {feedback && <p role="status" className="text-sm">{feedback}</p>}
    {showCreator && <div className="rounded-xl border p-4 space-y-4 max-w-3xl">
      <div><h3 className="text-lg font-semibold">Create and design a recurring series</h3><p className="text-sm text-muted-foreground">Evaluate before adding. Saving keeps the series paused, and AI review is a single optional low-cost call. Nothing is activated or published automatically.</p></div>
      <label className="block text-sm space-y-1"><span className="font-medium">Series name</span><input className="w-full rounded-md border bg-transparent p-2" maxLength={70} value={newSeries.name} onChange={e=>{setNewSeries(v=>({...v,name:e.target.value}));setNewDesign(null);}} placeholder="e.g. Aakash Tries Everything" /></label>
      <label className="block text-sm space-y-1"><span className="font-medium">Recurring premise and what makes it different</span><textarea className="w-full rounded-md border bg-transparent p-2" maxLength={500} rows={3} value={newSeries.angle} onChange={e=>{setNewSeries(v=>({...v,angle:e.target.value}));setNewDesign(null);}} placeholder="One repeatable real-life format, stakes, voice, and why a viewer would return" /></label>
      <label className="block text-sm space-y-1"><span className="font-medium">Audience (optional)</span><input className="w-full rounded-md border bg-transparent p-2" value={newSeries.audience || ''} onChange={e=>setNewSeries(v=>({...v,audience:e.target.value}))} maxLength={150}/></label>
      <fieldset className="space-y-1"><legend className="text-sm font-medium">Platforms</legend><div className="flex flex-wrap gap-3">{['instagram','youtube','linkedin','x'].map(channel=><label key={channel} className="flex items-center gap-1.5 text-sm capitalize"><input type="checkbox" checked={newSeries.channels.includes(channel)} onChange={e=>{setNewSeries(v=>({...v,channels:e.target.checked?[...v.channels,channel]:v.channels.filter(x=>x!==channel)}));setNewDesign(null)}} />{channel}</label>)}</div></fieldset>
      <button type="button" disabled={busy !== null} onClick={suggestNewSeries} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40">{busy === 'suggest' ? 'Suggesting…' : 'Suggest a new series for me'}</button>
      <button type="button" disabled={busy !== null || newSeries.name.trim().length < 4 || newSeries.angle.trim().length < 25 || !newSeries.channels.length} onClick={reviewNewSeries} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40">{busy === 'design' ? 'Reviewing…' : 'Ask AI to review & design'}</button>
      {newDesign && <div className="rounded-lg border p-4 space-y-3 text-sm">
        <div className="font-semibold">Editorial concept score: {newDesign.score}/10 · {newDesign.verdict.toUpperCase()} · {newDesign.aiAssisted ? 'AI-assisted' : 'Offline review'}</div>
        {newDesign.warning && <p className="text-amber-600">{newDesign.warning}</p>}
        <p><strong>Series promise:</strong> {newDesign.creativeKit.premise}</p>
        <p><strong>Visual identity:</strong> {newDesign.creativeKit.visualIdentity}</p>
        <p><strong>Voice:</strong> {newDesign.creativeKit.voice}</p>
        <p><strong>Cadence:</strong> {newDesign.creativeKit.suggestedCadence}</p>
        <div><strong>Episode sequence</strong><ol className="list-decimal pl-5">{newDesign.creativeKit.episodeStructure.map((beat,i)=><li key={i}>{beat}</li>)}</ol></div>
        <div><strong>Hooks</strong><ul className="list-disc pl-5">{newDesign.creativeKit.hookPatterns.map((hook,i)=><li key={i}>{hook}</li>)}</ul></div>
        <div><strong>Episode concepts</strong><ul className="list-disc pl-5">{newDesign.creativeKit.episodeIdeas.map((idea,i)=><li key={i}>{idea}</li>)}</ul></div>
        <div><strong>What to improve</strong><ul className="list-disc pl-5">{newDesign.improvements.map((text,i)=><li key={i}>{text}</li>)}</ul></div>
        <div><strong>Risks</strong><ul className="list-disc pl-5">{newDesign.risks.map((text,i)=><li key={i}>{text}</li>)}</ul></div>
        <button type="button" disabled={busy !== null} onClick={saveNewSeries} className="rounded-lg border px-3 py-2 font-medium disabled:opacity-40">Save as paused series</button>
      </div>}
    </div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.groups.map((series: Series) => {
      const recommendation = recommendations.find(r => r.key === series.key);
      return <article key={series.key} className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{series.name}</h3><span className="text-xs uppercase opacity-65">{series.status}</span></div>
        <p className="text-xs text-muted-foreground">{series.angle}</p>
        {series.creativeKit && typeof series.creativeKit.visualIdentity === 'string' && <p className="text-xs opacity-70"><strong>Creative identity:</strong> {series.creativeKit.visualIdentity}</p>}
        {recommendation && <div className="rounded-lg border px-3 py-2 text-xs space-y-1">
          <strong>{recommendation.recommendation === "consider_rotation" ? "Rotation candidate" : recommendation.recommendation === "keep" ? "Performing / retain" : "Collect more data"}</strong>
          <p>{recommendation.engagementPerThousand === null ? "Engagement rate not available" : `${recommendation.engagementPerThousand} saves + shares + followers per 1,000 impressions`}</p>
          <p>{recommendation.note}</p>
        </div>}
        <div className="grid grid-cols-3 gap-2 text-center"><div><strong className="block text-lg">{fmt(series.published)}</strong><span className="text-xs">Published</span></div><div><strong className="block text-lg">{fmt(series.measured)}</strong><span className="text-xs">Measured</span></div><div><strong className="block text-sm">{series.reviewStatus === "review_ready" ? "Review" : "Learning"}</strong><span className="text-xs">Signal</span></div></div>
        <div className="flex flex-wrap gap-3 items-center">
          <button type="button" onClick={() => setExpanded(expanded === series.key ? null : series.key)} className="text-sm underline underline-offset-4">{expanded === series.key ? "Hide" : "Show"} channels</button>
          {series.status !== "retired" && <button type="button" disabled={busy !== null || (series.status === "paused" && data.activeCount >= data.activeLimit)} onClick={() => changeStatus(series)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">{series.status === "active" ? "Pause" : "Activate"}</button>}
        </div>
        {expanded === series.key && <div className="space-y-2 text-xs">{Object.entries(series.byPlatform).length === 0 ? <p>No tagged published posts in this period.</p> : Object.entries(series.byPlatform).map(([platform, m]) => <div key={platform} className="rounded-lg border p-2">
          <div className="font-semibold capitalize">{platform}: {m.posts} posts / {m.measured} measured</div>
          <div>{fmt(m.impressions)} impressions · {fmt(m.views)} views · {fmt(m.shares)} shares · {fmt(m.saves)} saves · {fmt(m.followersGained)} followers</div>
          <div>Average watched: {m.averageWatchPercentage === null ? "Not available" : `${m.averageWatchPercentage}%`}</div>
        </div>)}</div>}
      </article>;
    })}</div>
    <p className="text-xs text-muted-foreground">{data.note}</p>
    <h3 className="text-lg font-semibold">Rolling seven-day creator requirements</h3>
    <p className="text-sm text-muted-foreground">Draft/planned output and delivered posts are different. The actual column comes from published records, including manually completed publications.</p>
    <div className="grid gap-3 xl:grid-cols-3">
      <QuotaPanel heading="Next 7 days · reserved creator slots" quota={quota?.rollingPlan}/>
      <QuotaPanel heading="Next 7 days · finished assets ready for review" quota={quota?.rollingReadiness?.ready}/>
      <QuotaPanel heading="Previous 7 local dates · actually published" quota={quota?.previousSevenDaysPublished}/>
      <QuotaPanel heading="Next 7 days · already scheduled" quota={quota?.upcomingSevenDaysScheduled}/>
    </div>
    {quota?.rollingReadiness && quota.rollingReadiness.draftsRequiringReview > 0 && <p className="text-sm text-amber-500">{quota.rollingReadiness.draftsRequiringReview} creator slots need scripting, evidence checks or approval. Reserved slots do not mean content is ready to publish.</p>}
    <p className="text-xs text-muted-foreground">Published is historical; scheduled is a queue, not a guarantee. Quota recovery protects the seven-day calendar without paying to regenerate a whole week. Draft placeholders are always marked not ready and cannot be counted as actual delivery.</p>
  </section>;
}
