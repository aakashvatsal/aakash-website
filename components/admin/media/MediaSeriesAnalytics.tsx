"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  changeMediaSeriesStatus,
  designMediaSeries,
  suggestMediaSeries,
  createMediaSeries,
  reviewMediaSeries,
  updateMediaSeries,
  removeMediaSeries,
  MEDIA_SERIES_SOURCE_TOPICS,
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
  const [newSeries, setNewSeries] = useState<NewMediaSeriesPitch>({name: '', angle: '', channels: ['instagram','youtube'], audience: '', sourceTopics: [], topicKeywords: [], creativeDirection: ''});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newDesign, setNewDesign] = useState<MediaSeriesDesign | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

  function resetEditor() {
    setEditingKey(null);
    setNewDesign(null);
    setShowCreator(false);
    setNewSeries({name:'', angle:'', audience:'', channels:['instagram','youtube'], sourceTopics:[], topicKeywords:[], creativeDirection:''});
  }
  function editSeries(series: Series) {
    setNewSeries({ name:series.name, angle:series.angle || '', audience:series.audience || '',
      channels:[...series.channels], sourceTopics:[...(series.sourceTopics ?? [])],
      topicKeywords:[...(series.topicKeywords ?? [])], creativeDirection:series.creativeDirection || '' });
    setEditingKey(series.key);
    setNewDesign(null);
    setShowCreator(true);
    setFeedback('');
    // The form is above the cards; make it discoverable after edit is clicked.
    window.requestAnimationFrame(() => document.getElementById('media-series-editor')?.scrollIntoView({behavior:'smooth', block:'start'}));
  }
  async function removeSeries(series: Series) {
    if (!window.confirm(`Remove “${series.name}” from new content plans? Published history will be preserved. This cannot be undone from the interface.`)) return;
    setBusy(series.key); setFeedback('');
    try { await removeMediaSeries(series.key); setFeedback(`${series.name} removed from the active portfolio. Generate a fresh week to use your changes.`); router.refresh(); }
    catch(error) { setFeedback(error instanceof Error ? error.message : 'Could not remove series'); }
    finally { setBusy(null); }
  }
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
      const saved = editingKey
        ? await updateMediaSeries(editingKey, newSeries)
        : await createMediaSeries({ ...newSeries, design: newDesign ?? undefined });
      setFeedback(editingKey
        ? `${saved.name} updated. Regenerate the Media week to use the new series brief; scheduled and published assets remain unchanged.`
        : `${saved.name} saved as PAUSED. Activate it to include it in the next generated plan.`);
      resetEditor(); router.refresh();
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
      const result = await reviewMediaSeries(false);
      setFeedback(result.applied && result.proposed
        ? `Suggestion: pause ${result.proposed.retire} and activate ${result.proposed.activate} if you agree.`
        : result.proposed ? `Suggested rotation: ${result.proposed.retire} → ${result.proposed.activate}. Make changes yourself using Pause / Activate.` : result.reason);
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
        <button type="button" onClick={() => { if (showCreator && !editingKey) resetEditor(); else { resetEditor(); setShowCreator(true); } }} className="rounded-lg border px-3 py-2 text-sm">{showCreator && !editingKey ? 'Close creator' : 'Create a new series'}</button>
        <button type="button" disabled={busy !== null} onClick={runReview} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Preview performance review</button>
      </div>
    </div>
    {feedback && <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm"><span>{feedback}</span><Link href="/admin/media/plan" className="font-semibold underline underline-offset-4">Open Media Plan → Regenerate week</Link></div>}
    <p className="text-sm text-muted-foreground">You control the series HSAKAA writes next: create, edit, pause, activate or remove. Choose the source topics (hobbies, books, founder work, daily life and more), then regenerate the Media week. Personal data is never publication consent.</p>
    {showCreator && <div id="media-series-editor" className="rounded-xl border p-4 space-y-4 max-w-3xl scroll-mt-24">
      <div><h3 className="text-lg font-semibold">{editingKey ? `Edit ${newSeries.name}` : 'Create and design a recurring series'}</h3><p className="text-sm text-muted-foreground">Give HSAKAA a precise story promise, the life areas it may consider and specific keywords. New series start paused. Editing keeps the existing activation status. Historical posts stay untouched.</p></div>
      <label className="block text-sm space-y-1"><span className="font-medium">Series name</span><input className="w-full rounded-md border bg-transparent p-2" maxLength={70} value={newSeries.name} onChange={e=>{setNewSeries(v=>({...v,name:e.target.value}));setNewDesign(null);}} placeholder="e.g. Aakash Tries Everything" /></label>
      <label className="block text-sm space-y-1"><span className="font-medium">Recurring premise and what makes it different</span><textarea className="w-full rounded-md border bg-transparent p-2" maxLength={500} rows={3} value={newSeries.angle} onChange={e=>{setNewSeries(v=>({...v,angle:e.target.value}));setNewDesign(null);}} placeholder="One repeatable real-life format, stakes, voice, and why a viewer would return" /></label>
      <label className="block text-sm space-y-1"><span className="font-medium">Audience (optional)</span><input className="w-full rounded-md border bg-transparent p-2" value={newSeries.audience || ''} onChange={e=>setNewSeries(v=>({...v,audience:e.target.value}))} maxLength={150}/></label>
      <fieldset className="space-y-1"><legend className="text-sm font-medium">Platforms</legend><div className="flex flex-wrap gap-3">{['instagram','youtube','linkedin','x'].map(channel=><label key={channel} className="flex items-center gap-1.5 text-sm capitalize"><input type="checkbox" checked={newSeries.channels.includes(channel)} onChange={e=>{setNewSeries(v=>({...v,channels:e.target.checked?[...v.channels,channel]:v.channels.filter(x=>x!==channel)}));setNewDesign(null)}} />{channel}</label>)}</div></fieldset>
      <fieldset className="space-y-2"><legend className="text-sm font-semibold">Where should HSAKAA find story ideas?</legend>
        <p className="text-xs text-muted-foreground">These are discovery hints, not automatic permission to quote private records. Hobbies and connected personal context must have real evidence.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{MEDIA_SERIES_SOURCE_TOPICS.map(topic =>
          <label key={topic.key} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input type="checkbox" checked={(newSeries.sourceTopics ?? []).includes(topic.key)}
              onChange={e => {setNewSeries(old => ({...old, sourceTopics:e.target.checked ? [...(old.sourceTopics ?? []), topic.key] : (old.sourceTopics ?? []).filter(key => key !== topic.key)}));setNewDesign(null);}} />{topic.label}
          </label>)}</div>
      </fieldset>
      <label className="block text-sm space-y-1"><span className="font-medium">Specific keywords / skills (comma separated)</span>
        <input className="w-full rounded-md border bg-transparent p-2" value={(newSeries.topicKeywords ?? []).join(', ')}
          onChange={e => setNewSeries(old => ({...old,topicKeywords:e.target.value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,20)}))}
          placeholder="guitar, chess, Spanish, books, Afghanistan" />
        <span className="block text-xs text-muted-foreground">Use exact topics to help match newly generated scripts to this series. Up to 20.</span>
      </label>
      <label className="block text-sm space-y-1"><span className="font-medium">Creative direction (optional)</span>
        <textarea className="w-full rounded-md border bg-transparent p-2" maxLength={750} rows={3} value={newSeries.creativeDirection || ''}
          onChange={e=>setNewSeries(old=>({...old,creativeDirection:e.target.value}))}
          placeholder="Opening hooks, on-camera storytelling, filming energy, episode shape, tone, visual cues, and what the series must avoid" />
      </label>
      {editingKey && <p className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">Series identity key remains unchanged so old analytics and published content stay connected.</p>}
      <button type="button" disabled={busy !== null || !!editingKey} onClick={suggestNewSeries} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40">{busy === 'suggest' ? 'Suggesting…' : 'Suggest a new series for me'}</button>
      <button type="button" disabled={busy !== null || !!editingKey || newSeries.name.trim().length < 4 || newSeries.angle.trim().length < 25 || !newSeries.channels.length} onClick={reviewNewSeries} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40">{busy === 'design' ? 'Reviewing…' : 'Ask AI to review & design'}</button>
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
        {!editingKey && <button type="button" disabled={busy !== null} onClick={saveNewSeries} className="rounded-lg border px-3 py-2 font-medium disabled:opacity-40">Save as paused series</button>}
      </div>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy !== null || newSeries.name.trim().length < 4 || newSeries.angle.trim().length < 25 || !newSeries.channels.length}
          onClick={saveNewSeries} className="rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background disabled:opacity-40">{busy === 'create' ? 'Saving…' : editingKey ? 'Save series changes' : 'Save new series'}</button>
        <button type="button" onClick={resetEditor} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
      </div>
    </div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.groups.map((series: Series) => {
      const recommendation = recommendations.find(r => r.key === series.key);
      return <article key={series.key} className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{series.name}</h3><span className="text-xs uppercase opacity-65">{series.status}</span></div>
        <p className="text-xs text-muted-foreground">{series.angle}</p>
        {!!series.sourceTopics?.length && <div className="flex flex-wrap gap-1">{series.sourceTopics.map(topic => <span key={topic} className="rounded-full border px-2 py-0.5 text-[11px] opacity-70">{MEDIA_SERIES_SOURCE_TOPICS.find(item => item.key === topic)?.label || topic}</span>)}</div>}
        {!!series.topicKeywords?.length && <p className="text-xs opacity-70"><strong>Topics:</strong> {series.topicKeywords.join(', ')}</p>}
        {!!series.creativeDirection && <p className="text-xs opacity-70"><strong>Direction:</strong> {series.creativeDirection}</p>}
        {series.creativeKit && typeof series.creativeKit.visualIdentity === 'string' && <p className="text-xs opacity-70"><strong>Creative identity:</strong> {series.creativeKit.visualIdentity}</p>}
        {recommendation && <div className="rounded-lg border px-3 py-2 text-xs space-y-1">
          <strong>{recommendation.recommendation === "consider_rotation" ? "Rotation candidate" : recommendation.recommendation === "keep" ? "Performing / retain" : "Collect more data"}</strong>
          <p>{recommendation.engagementPerThousand === null ? "Engagement rate not available" : `${recommendation.engagementPerThousand} saves + shares + followers per 1,000 impressions`}</p>
          <p>{recommendation.note}</p>
        </div>}
        <div className="grid grid-cols-3 gap-2 text-center"><div><strong className="block text-lg">{fmt(series.published)}</strong><span className="text-xs">Published</span></div><div><strong className="block text-lg">{fmt(series.measured)}</strong><span className="text-xs">Measured</span></div><div><strong className="block text-sm">{series.reviewStatus === "review_ready" ? "Review" : "Learning"}</strong><span className="text-xs">Signal</span></div></div>
        <div className="flex flex-wrap gap-3 items-center">
          <button type="button" onClick={() => setExpanded(expanded === series.key ? null : series.key)} className="text-sm underline underline-offset-4">{expanded === series.key ? "Hide" : "Show"} channels</button>
          <button type="button" disabled={busy !== null} onClick={() => editSeries(series)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">Edit</button>
          {series.status !== "retired" && <button type="button" disabled={busy !== null || (series.status === "paused" && data.activeCount >= data.activeLimit)} onClick={() => changeStatus(series)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">{series.status === "active" ? "Pause" : "Activate"}</button>}
          <button type="button" disabled={busy !== null} onClick={() => removeSeries(series)} className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-500 disabled:opacity-40">Remove</button>
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
