"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { studioRequest, type Series, type SeriesPitch, type SeriesReview, type StudioGrowth, type StudioOverview, type StudioPost, type StudioRelease, type StudioReleaseAnalytics } from "@/lib/api/media-studio";

type Tab = "calendar" | "series" | "create" | "growth";
const PLATFORMS = [
  {key:"instagram",label:"Instagram"},{key:"youtube",label:"YouTube"},
  {key:"linkedin",label:"LinkedIn"},{key:"x",label:"X"},{key:"whatsapp",label:"WhatsApp Stories"},
] as const;
const TOPICS = [
  {key:"hobbies",label:"Hobbies"},{key:"books",label:"Books"},
  {key:"companies",label:"Companies"},{key:"projects",label:"Projects"},
  {key:"tasks",label:"Tasks"},{key:"daily-life",label:"Daily life"},
  {key:"travel",label:"Travel"},{key:"pets",label:"Dogs / Pets"},
  {key:"health-routines",label:"Approved wellness habits"},
  {key:"world-cultures",label:"World cultures"},
];
const blank:SeriesPitch = {name:"",angle:"",channels:["instagram"],audience:"",
  sourceTopics:[],topicKeywords:[],creativeDirection:""};
const cap=(s:string)=>s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
function Toggle({value,active,onClick}:{value:string;active:boolean;onClick:()=>void}){
  return <button type="button" onClick={onClick} aria-pressed={active}
    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active?"border-lime-400/60 bg-lime-300 text-black":"border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/10"}`}>
      {active?"✓ ":""}{value}
    </button>;
}
function TabButton({id,title,selected,onClick}:{id:Tab;title:string;selected:boolean;onClick:()=>void}){
  return <button type="button" onClick={onClick} aria-current={selected?"page":undefined}
    className={`rounded-xl px-4 py-2 text-sm font-bold ${selected?"bg-[#C6FF32] text-black":"border border-white/15 text-white/70 hover:bg-white/10"}`}>{title}</button>;
}
export function MediaStudioManager(){
  const [tab,setTab]=useState<Tab>("calendar");
  const [overview,setOverview]=useState<StudioOverview|null>(null);
  const [series,setSeries]=useState<Series[]>([]);
  const [growth,setGrowth]=useState<StudioGrowth|null>(null);
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const [loaded,setLoaded]=useState({overview:false,series:false});
  const [dayIndex,setDayIndex]=useState(0);
  const [release,setRelease]=useState<StudioRelease|null>(null);
  const [releaseAnalytics,setReleaseAnalytics]=useState<StudioReleaseAnalytics|null>(null);
  const [selectedPost,setSelectedPost]=useState<StudioPost|null>(null);
  const [draft,setDraft]=useState<SeriesPitch>(blank);
  const [editKey,setEditKey]=useState<string|null>(null);
  const [review,setReview]=useState<SeriesReview|null>(null);
  const [savedReview,setSavedReview]=useState<{key:string;concept:SeriesReview;actualPerformance?:{note?:string;engagementPerThousand?:number|null;measured?:number}|null}|null>(null);
  // Load overview and series independently. A Studio API failure must not
  // hide a healthy series portfolio or misleadingly display it as "0 active".
  const refresh=useCallback(async()=>{
    setLoading(true);
    const [calendar,portfolio,production]=await Promise.allSettled([
      studioRequest<StudioOverview>("studio"),
      studioRequest<{groups:Series[]}>("core/series?days=90"),
      studioRequest<StudioRelease>("studio/release"),
    ]);
    const errors:string[]=[];
    const describe=(label:string,cause:unknown)=>{
      const detail=cause instanceof Error?cause.message:String(cause);
      if(/owner authentication required/i.test(detail)){
        return `${label}: The backend could not verify your owner session. Make sure ADMIN_SESSION_SECRET is identical on the web and backend servers; restart them and sign in again.`;
      }
      if(/admin authentication required/i.test(detail)){
        return `${label}: Your admin session expired. Sign in again.`;
      }
      return `${label}: ${detail}`;
    };
    if(calendar.status==="fulfilled"){
      setOverview(calendar.value);setLoaded(s=>({...s,overview:true}));
    }else{
      setOverview(null);setLoaded(s=>({...s,overview:false}));
      errors.push(describe("Calendar",calendar.reason));
    }
    if(portfolio.status==="fulfilled"){
      setSeries(portfolio.value.groups||[]);setLoaded(s=>({...s,series:true}));
    }else{
      setSeries([]);setLoaded(s=>({...s,series:false}));
      errors.push(describe("Series",portfolio.reason));
    }
    if(production.status==="fulfilled")setRelease(production.value);
    else errors.push(describe("Production handoff",production.reason));
    setError(errors.join(" "));
    setLoading(false);
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  useEffect(()=>{if(tab==="growth"){
    void Promise.allSettled([
      studioRequest<StudioGrowth>("studio/growth"),studioRequest<StudioReleaseAnalytics>("studio/release/analytics")
    ]).then(([g,a])=>{
      if(g.status==="fulfilled")setGrowth(g.value);
      if(a.status==="fulfilled")setReleaseAnalytics(a.value);
      if(a.status==="rejected")setError(String(a.reason));
    });
  }},[tab]);
  const selectedDay=overview?.days[dayIndex];
  const active=series.filter(x=>x.status==="active").length;
  const totalReady=overview?.days.reduce((n,d)=>n+d.counts.ready,0)||0;
  const totalScheduled=overview?.days.reduce((n,d)=>n+d.counts.total,0)||0;
  const selectedSeries=series.find(x=>x.key===editKey);
  const setDraftValue=<K extends keyof SeriesPitch>(key:K,value:SeriesPitch[K])=>
    setDraft(prev=>({...prev,[key]:value}));
  const flash=(text:string)=>{setError("");setMessage(text);};
  const run=async(name:string,fn:()=>Promise<void>)=>{
    if(busy)return;
    setBusy(name);setError("");setMessage("");
    try{await fn();}catch(e){setError(e instanceof Error?e.message:String(e));}
    finally{setBusy("");}
  };
  const startEdit=(s?:Series)=>{
    if(s){
      setEditKey(s.key);
      setDraft({name:s.name,angle:s.angle||"",channels:[...s.channels],audience:s.audience||"",
        sourceTopics:[...(s.sourceTopics||[])],topicKeywords:[...(s.topicKeywords||[])],
        creativeDirection:s.creativeDirection||""});
    }else{setEditKey(null);setDraft({...blank,channels:["instagram"]});}
    setReview(null);setSavedReview(null);setTab("series");
  };
  const updateSeriesStatus=(s:Series,status:"active"|"paused")=>run("status",async()=>{
    await studioRequest(`core/series/${encodeURIComponent(s.key)}/status`,"PATCH",{status});
    await refresh();flash(`${s.name} is now ${status}. New plans use this change.`);
  });
  const saveSeries=()=>run("save",async()=>{
    if(editKey)await studioRequest(`core/series/${encodeURIComponent(editKey)}`,"PATCH",draft);
    else await studioRequest("core/series/create","POST",draft);
    startEdit();await refresh();flash("Saved. Series changes affect newly generated content only.");
  });
  const analyze=()=>run("analyze",async()=>{
    const result=await studioRequest<SeriesReview>("core/series/design","POST",draft);
    setReview(result);flash(result.aiAssisted?"AI assessment completed.":"Offline concept assessment completed.");
  });
  const analyzeSaved=(s:Series)=>run("analyzeSaved",async()=>{
    const result=await studioRequest<{key:string;concept:SeriesReview;actualPerformance?:{note?:string;measured?:number;engagementPerThousand?:number|null}}> (`core/series/${encodeURIComponent(s.key)}/analyze`,"POST",{});
    setSavedReview(result);
    flash(`Assessment for ${s.name} completed.`);
  });
  const remove=(s:Series)=>run("remove",async()=>{
    if(!window.confirm(`Remove "${s.name}" from future planning? Published history will remain.`))return;
    await studioRequest(`core/series/${encodeURIComponent(s.key)}`,"DELETE");
    await refresh();flash("Removed from future plans. Historical posts preserved.");
  });
  const generateDay=(date:string,replace=false)=>run("generate",async()=>{
    const result=await studioRequest<{ready?:number;total?:number;error?:string}>("studio/generate","POST",{date,replace});
    await refresh();
    flash(`${date}: ${result.ready??0} of ${result.total??0} writing packs ready. Review incomplete packs before publishing.`);
  });
  const generateAll=()=>run("generateAll",async()=>{
    if(!overview?.seriesReady)throw new Error("Activate between 5 and 8 series first.");
    let done=0;
    const failures:string[]=[];
    for(const date of overview.days.map(d=>d.date)){
      setMessage(`Writing unfinished assets for ${date} (${done+1}/8)…`);
      try{await studioRequest("studio/generate","POST",{date,replace:false});}
      catch(e){failures.push(`${date}: ${e instanceof Error?e.message:String(e)}`);}
      done++;await refresh();
    }
    if(failures.length)setError(`Some dates could not be processed: ${failures.join(' | ')}`);
    flash(`Eight calendar days checked. ${8-failures.length}/8 processed; completed packages were preserved. Open any remaining Writing Failed cards to retry.`);
  });
  const setPostReady=(p:StudioPost)=>run("ready",async()=>{
    const updated=await studioRequest<StudioPost>(`studio/posts/${p.date}/${encodeURIComponent(p.id)}`,"PATCH",{status:"ready"});
    await refresh();
    setSelectedPost(updated);
    flash("Writing marked ready. This does not publish or schedule the post.");
  });
  const improvePost=(p:StudioPost)=>run("improve",async()=>{
    const result=await studioRequest<{improved:boolean;post:StudioPost;editorial?:{score:number};reason:string}>(
      `studio/posts/${p.date}/${encodeURIComponent(p.id)}/improve`,"POST",{});
    await refresh();setSelectedPost(result.post);
    flash(result.improved?`Improved editorial score to ${result.editorial?.score??"—"}/10. ${result.reason}`:result.reason);
  });
  const handoff=(p:StudioPost)=>run("handoff",async()=>{
    const result=await studioRequest<{publicationId:string;next:string}>(
      `studio/posts/${p.date}/${encodeURIComponent(p.id)}/handoff`,"POST",{});
    setRelease(await studioRequest<StudioRelease>("studio/release"));
    flash(`Production draft ${result.publicationId} created or recovered. Finish assets and approval in Media Production before scheduling.`);
  });
  const currentRelease=selectedPost?release?.packages.find(p=>p.date===selectedPost.date&&p.id===selectedPost.id):null;
  const openPost=(p:StudioPost)=>{setSelectedPost(p);setTab("create");};
  return <main className="space-y-6 text-white">
    <header className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <div className="text-xs font-black uppercase tracking-[.2em] text-[#C6FF32]">HSAKAA · Media Studio</div>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Make content worth watching.</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">One English-language writer, calendar and growth cockpit. No fake ready scripts. Real stories from your approved life, learning and work.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <TabButton id="calendar" title="8-Day Calendar" selected={tab==="calendar"} onClick={()=>setTab("calendar")}/>
        <TabButton id="series" title={`Series (${active}/8)`} selected={tab==="series"} onClick={()=>setTab("series")}/>
        <TabButton id="create" title="Scripts & Shooting" selected={tab==="create"} onClick={()=>setTab("create")}/>
        <TabButton id="growth" title="Growth & Audience" selected={tab==="growth"} onClick={()=>setTab("growth")}/>
      </div>
    </header>
    {error&&<div role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
      <p>{error}</p>
      <button type="button" disabled={loading} onClick={()=>void refresh()}
        className="mt-3 rounded-lg border border-red-300/40 px-3 py-1.5 text-xs font-bold">Retry connection</button>
    </div>}
    {loading&&<p role="status" className="text-sm text-white/50">Connecting to Media Studio and loading series…</p>}
    {message&&<div role="status" className="rounded-xl border border-lime-300/30 bg-lime-300/5 p-4 text-sm text-lime-200">{message}</div>}
    {tab==="calendar"&&<section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 p-4"><div className="text-xs text-white/55">Writing packs ready</div><div className="mt-2 text-3xl font-black">{loaded.overview?totalReady:"—"}<span className="text-lg text-white/40">/{loaded.overview?totalScheduled:"—"}</span></div></div>
        <div className="rounded-2xl border border-white/10 p-4"><div className="text-xs text-white/55">Active series</div><div className="mt-2 text-3xl font-black">{loaded.series?active:"—"}<span className="text-lg text-white/40"> / 5–8</span></div></div>
        <div className="rounded-2xl border border-white/10 p-4"><div className="text-xs text-white/55">Calendar coverage</div><div className="mt-2 text-xl font-black">{overview?.today||"—"}<span className="ml-2 text-xs text-white/45">through {overview?.through||"—"}</span></div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
        <div><div className="font-bold">Today + seven future days</div><p className="text-xs text-white/50">Automatic daily fill at 05:05 IST. AI writes and checkpoints each asset separately. Failed requests can resume without rewriting completed scripts. Writing review is not publication approval.</p></div>
        <button disabled={!!busy||loading||!loaded.overview||!loaded.series||!overview?.seriesReady} onClick={generateAll} className="rounded-xl bg-[#C6FF32] px-4 py-2.5 font-bold text-black disabled:opacity-40">{busy==="generateAll"?"Generating…":"Fill Missing Days"}</button>
      </div>
      {loaded.overview&&loaded.series&&!overview?.seriesReady&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/40 p-3 text-sm text-amber-200">
        <span>Activate 5–8 series and cover Instagram, YouTube, LinkedIn and X. Missing: {overview?.missingRequiredChannels?.join(", ")||"series count"}.</span>
        <button type="button" onClick={()=>setTab("series")} className="rounded-lg border border-amber-300/50 px-3 py-1.5 font-bold">Manage series</button>
      </div>}
      <div className="flex gap-2 overflow-x-auto pb-2">{overview?.days.map((d,i)=>
        <button key={d.date} onClick={()=>setDayIndex(i)} className={`shrink-0 rounded-xl border px-4 py-3 text-left text-sm ${dayIndex===i?"border-[#C6FF32] bg-[#C6FF32]/10":"border-white/15"}`}>
          <div className="font-bold">{d.date.slice(5)}</div><div className="text-xs text-white/50">{d.counts.ready}/{d.counts.total} ready{d.counts.writingFailed?` · ${d.counts.writingFailed} failed`:""}</div>
        </button>)}</div>
      {selectedDay&&<div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">{selectedDay.date}</h2>
          <div className="flex flex-wrap gap-2">
            <button disabled={!!busy} onClick={()=>generateDay(selectedDay.date,false)}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold">{selectedDay.posts.length?"Retry Unfinished":"Write Day"}</button>
            {selectedDay.posts.length>0&&<button disabled={!!busy} onClick={()=>{
              if(window.confirm("Rewrite all writing for this day? This uses AI credits and can replace completed drafts."))
                void generateDay(selectedDay.date,true);
            }} className="rounded-xl border border-amber-300/30 px-4 py-2 text-sm font-bold text-amber-200">Rewrite Entire Day (AI credits)</button>}
          </div>
        </div>
        {selectedDay.error&&<p className="text-xs text-amber-300">{selectedDay.error}</p>}
        {selectedDay.usage&&<p className="text-xs text-white/50">AI calls: {selectedDay.usage.calls}/{selectedDay.usage.maxCalls} · Input: {selectedDay.usage.inputTokens.toLocaleString()} tokens · Output: {selectedDay.usage.outputTokens.toLocaleString()} tokens · Reserved output budget: {selectedDay.usage.outputReserved}/{selectedDay.usage.maxOutputBudget}</p>}
        {selectedDay.posts.length===0&&<div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/50">No writing packs yet. Choose Write Day or Fill Missing Days.</div>}
        <div className="grid gap-3 lg:grid-cols-2">{selectedDay.posts.map(post=><button type="button" key={post.id}
          onClick={()=>openPost(post)} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left hover:border-lime-300/40">
          <div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold uppercase tracking-widest text-lime-300">{post.platform} · {cap(post.format)}</span>
            <span className={post.status==="ready"?"text-lime-300":"text-amber-300"}>{cap(post.status)}</span></div>
          <h3 className="mt-3 text-lg font-bold">{post.title||"Writing pending"}</h3>
          <p className="mt-2 text-sm text-white/65">{post.hook||post.reason}</p>
          <p className="mt-3 text-xs text-white/55">{post.seriesName} · {post.trend?.status==="verified_signal"?`Trend signal: ${post.trend.title}`:"Evergreen · no verified trend"}</p>
          {release?.packages.find(x=>x.date===post.date&&x.id===post.id)?.publicationId&&<p className="mt-2 text-xs text-sky-300">Production: {cap(release.packages.find(x=>x.date===post.date&&x.id===post.id)?.productionStatus||"")} · Delivery: {cap(release.packages.find(x=>x.date===post.date&&x.id===post.id)?.deliveryStatus||"")}</p>}
          {post.editorial&&<p className={`mt-2 text-xs font-bold ${post.editorial.pass?"text-lime-300":"text-amber-300"}`}>Independent editorial {post.editorial.score}/10 · {post.editorial.pass?"Passed":"Needs improvement"}</p>}
          <p className="mt-2 text-xs text-white/40">Open full script & shoot plan</p>
        </button>)}</div>
      </div>}
    </section>}
    {tab==="series"&&<section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2"><div><h2 className="text-xl font-black">Your series</h2><p className="text-xs text-white/50">5–8 active at once; save unlimited paused concepts.</p></div>
          <button type="button" onClick={()=>startEdit()} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-sm font-bold text-black">+ New series</button></div>
        {loaded.series&&series.length===0&&<p className="rounded-xl border border-white/15 p-4 text-sm text-white/65">There are no saved series yet. Create one here or check that the backend has initialized your default series.</p>}
        {!loaded.series&&<p className="rounded-xl border border-white/15 p-4 text-sm text-white/65">Series could not be loaded. Retry the connection before creating or changing series.</p>}
        {series.map(s=><div key={s.key} className="rounded-2xl border border-white/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{s.name}</h3>
            <p className="mt-1 text-sm text-white/55">{s.angle}</p></div><span className="text-xs uppercase text-white/50">{s.status}</span></div>
          <div className="mt-3 flex flex-wrap gap-1">{s.channels.map(ch=><span key={ch} className="rounded-full border border-white/15 px-2 py-1 text-[11px]">{cap(ch)}</span>)}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={()=>startEdit(s)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold">Edit</button>
            {s.status==="active"?<button disabled={!!busy} onClick={()=>updateSeriesStatus(s,"paused")} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold">Pause</button>:
              <button disabled={!!busy||active>=8} onClick={()=>updateSeriesStatus(s,"active")} className="rounded-lg border border-lime-300/40 px-3 py-1.5 text-xs font-bold text-lime-300">Activate</button>}
            <button disabled={!!busy} onClick={()=>analyzeSaved(s)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold">Analyze with AI</button>
            <button disabled={!!busy} onClick={()=>remove(s)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-200">Remove</button>
          </div>
          {savedReview?.key===s.key&&<div className="mt-4 rounded-xl bg-white/5 p-3 text-sm">
            <strong>Concept: {savedReview.concept.score}/10 · {savedReview.concept.verdict}</strong>
            {savedReview.concept.warning&&<p className="mt-2 text-amber-200">{savedReview.concept.warning}</p>}
            <p className="mt-2 text-white/65">Actual measured posts: {savedReview.actualPerformance?.measured??"Unavailable"}. {savedReview.actualPerformance?.note||"No trustworthy performance conclusion yet."}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-white/70">{savedReview.concept.improvements.map(x=><li key={x}>{x}</li>)}</ul>
          </div>}
        </div>)}
      </div>
      <div className="self-start rounded-2xl border border-white/15 bg-white/[0.03] p-5">
        <h2 className="text-xl font-black">{editKey?`Edit ${selectedSeries?.name||"series"}`:"Create a series"}</h2>
        <p className="mt-1 text-xs text-white/50">Changes apply to future writing, not previously published posts.</p>
        <div className="mt-4 space-y-4">
          <label className="block text-xs font-bold">Series name<input className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white" value={draft.name} onChange={e=>setDraftValue("name",e.target.value)} placeholder="e.g. World A–Z"/></label>
          <label className="block text-xs font-bold">Recurring story promise / angle<textarea rows={3} className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white" value={draft.angle} onChange={e=>setDraftValue("angle",e.target.value)} placeholder="Specific stories viewers can expect each episode…"/></label>
          <label className="block text-xs font-bold">Audience<input className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white" value={draft.audience||""} onChange={e=>setDraftValue("audience",e.target.value)} placeholder="Who should care?"/></label>
          <div><div className="mb-2 text-xs font-bold">Publish this series on</div><div className="flex flex-wrap gap-2">{PLATFORMS.map(ch=>
            <Toggle key={ch.key} value={ch.label} active={draft.channels.includes(ch.key)} onClick={()=>setDraftValue("channels",draft.channels.includes(ch.key)?draft.channels.filter(x=>x!==ch.key):[...draft.channels,ch.key])}/>)}</div></div>
          <div><div className="mb-2 text-xs font-bold">Sources to draw stories from</div><div className="flex flex-wrap gap-2">{TOPICS.map(t=>
            <Toggle key={t.key} value={t.label} active={(draft.sourceTopics||[]).includes(t.key)} onClick={()=>setDraftValue("sourceTopics",(draft.sourceTopics||[]).includes(t.key)?(draft.sourceTopics||[]).filter(x=>x!==t.key):[...(draft.sourceTopics||[]),t.key])}/>)}</div></div>
          <label className="block text-xs font-bold">Exact topic keywords (comma-separated)<input className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white" value={(draft.topicKeywords||[]).join(", ")} onChange={e=>setDraftValue("topicKeywords",e.target.value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,20))}/></label>
          <label className="block text-xs font-bold">Tone, filming and hook direction<textarea rows={3} className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white" value={draft.creativeDirection||""} onChange={e=>setDraftValue("creativeDirection",e.target.value)} placeholder="Playful, curious, two characters, hands-first shots, no motivational lines…"/></label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy||draft.name.trim().length<4||draft.angle.trim().length<25||!draft.channels.length} onClick={saveSeries} className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{busy==="save"?"Saving…":"Save series"}</button>
            <button type="button" disabled={!!busy||draft.name.trim().length<4||draft.angle.trim().length<25||!draft.channels.length} onClick={analyze} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold disabled:opacity-40">Evaluate concept</button>
            {editKey&&<button type="button" onClick={()=>startEdit()} className="px-3 py-2 text-sm text-white/55">Cancel</button>}
          </div>
          {review&&<div className="rounded-xl border border-lime-400/30 p-4 text-sm">
            <strong>{review.score}/10 · {cap(review.verdict)} · {review.aiAssisted?"AI assisted":"Offline only"}</strong>
            {review.warning&&<p className="mt-2 text-amber-200">{review.warning}</p>}
            <p className="mt-2 font-bold">Suggested improvements</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-white/70">{review.improvements.map(t=><li key={t}>{t}</li>)}</ul>
            <p className="mt-2 text-xs text-white/45">Advisory only. Your choice decides active series.</p>
          </div>}
        </div>
      </div>
    </section>}
    {tab==="create"&&<section className="space-y-4">
      <div><h2 className="text-xl font-black">Your word-for-word studio</h2><p className="text-sm text-white/55">Choose a post from the calendar to see the exact copy, scripts and filming instructions.</p></div>
      {!selectedPost&&<div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/50">
        <p>Open a post from the calendar to work with its complete creative package.</p>
        <button onClick={()=>setTab("calendar")} className="mt-3 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white">Open calendar</button>
      </div>}
      {selectedPost&&<div className="space-y-4">
        <div className="rounded-2xl border border-white/10 p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-lime-300">{selectedPost.platform} · {cap(selectedPost.format)} · {selectedPost.seriesName}</div>
          <h3 className="mt-2 text-2xl font-black">{selectedPost.title||"Research slot"}</h3>
          <div className={`mt-2 text-sm ${selectedPost.status==="ready"?"text-lime-300":"text-amber-300"}`}>{cap(selectedPost.status)} {selectedPost.reason&&`· ${selectedPost.reason}`}</div>
          {selectedPost.editorial&&<div className="mt-3 rounded-xl border border-white/15 bg-white/[0.03] p-4 text-sm">
            <p className={`font-bold ${selectedPost.editorial.pass?"text-lime-300":"text-amber-200"}`}>Independent editorial preflight: {selectedPost.editorial.score}/10 · {selectedPost.editorial.pass?"Passed":"Not yet passed"}</p>
            <div className="mt-2 flex flex-wrap gap-2">{Object.entries(selectedPost.editorial.dimensions||{}).map(([key,value])=><span key={key} className="rounded-full border border-white/15 px-2 py-1 text-xs">{cap(key)} {value}/10</span>)}</div>
            {!!selectedPost.editorial.issues?.length&&<ul className="mt-3 list-disc space-y-1 pl-4 text-amber-100/80">{selectedPost.editorial.issues.slice(0,6).map((issue,i)=><li key={i}>{issue}</li>)}</ul>}
            <p className="mt-3 text-xs text-white/45">Automated editorial screening, not a prediction of views or watch time. Final creative and publishing approval remain human decisions.</p>
          </div>}
          <p className="mt-3 text-xs text-white/50">{selectedPost.trend?.status==="verified_signal"?`Trend signal: ${selectedPost.trend.title} · ${selectedPost.trend.source} · ${selectedPost.trend.publishedAt}`:"Evergreen · no verified trend attribution"}</p>
          {selectedPost.storyArc&&<p className="mt-2 text-sm text-white/60">Story progression: {selectedPost.storyArc}</p>}
          <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.02] p-4 space-y-2 text-sm">
            <p className="font-bold">Production and publishing lifecycle</p>
            <p className="text-white/60">{currentRelease?.publicationId?`Production: ${cap(currentRelease.productionStatus)} · Delivery: ${cap(currentRelease.deliveryStatus)}`:"No production draft yet. Writing ready is not filming, approval or publication."}</p>
            {currentRelease?.publicationId?<div className="flex flex-wrap items-center gap-3">
              <a href="/admin/media/production" className="rounded-lg border border-lime-300/40 px-3 py-2 text-lime-300 font-bold">Open Media Production</a>
              <a href="/admin/media/review" className="rounded-lg border border-white/20 px-3 py-2">Final preflight review</a>
              <a href="/admin/media/calendar" className="rounded-lg border border-white/20 px-3 py-2">Schedule after approval</a>
              <span className="text-xs text-white/40">ID: {currentRelease.publicationId}</span>
            </div>:<button disabled={!!busy||selectedPost.status!=="ready"||!selectedPost.editorial?.pass} onClick={()=>handoff(selectedPost)}
              className="rounded-lg bg-lime-300 px-3 py-2 font-bold text-black disabled:opacity-40">Send approved writing to production</button>}
            <p className="text-xs text-white/45">No automatic publishing or fabricated delivery confirmation. Attach real assets, finish production and pass human preflight first.</p>
          </div>
          {selectedPost.status!=="ready"&&<div className="mt-3 flex flex-wrap gap-2">
            <button disabled={!!busy||!selectedPost.title||!selectedPost.script&&!selectedPost.copy&&!selectedPost.slides?.length} onClick={()=>improvePost(selectedPost)} className="rounded-xl border border-amber-300/40 px-3 py-2 text-sm font-bold text-amber-200">Improve this package · 1 AI request</button>
            <button disabled={!!busy||!selectedPost.editorial?.pass} onClick={()=>setPostReady(selectedPost)} title={!selectedPost.editorial?.pass?"Must pass independent editorial screening before readiness":"Mark writing ready"} className="rounded-xl border border-lime-300/40 px-3 py-2 text-sm font-bold text-lime-300 disabled:opacity-40">I reviewed it · Mark writing ready</button>
          </div>}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CopyPanel title="Selected opening hook" value={selectedPost.hook}/>
          <CopyPanel title="Alternative hooks" value={selectedPost.hookAlternatives.join("\n\n")}/>
          <CopyPanel title="Word-for-word script" value={selectedPost.script}/>
          <CopyPanel title="Direct-to-post copy" value={selectedPost.copy}/>
          <CopyPanel title="Final caption" value={selectedPost.caption}/>
          <CopyPanel title="Cover / thumbnail" value={selectedPost.cover}/>
          <CopyPanel title="Where to shoot" value={selectedPost.shotLocation}/>
          <CopyPanel title="Pinned comment" value={selectedPost.pinnedComment}/>
        </div>
        {!!selectedPost.shotList.length&&<div className="rounded-2xl border border-white/10 p-5"><h3 className="font-black">Exactly what to shoot</h3><div className="mt-3 grid gap-3">{selectedPost.shotList.map((shot,i)=>
          <div key={i} className="rounded-xl bg-white/[0.03] p-3 text-sm"><span className="font-bold text-lime-300">{shot.time}</span> · {shot.shot}
            <p className="mt-1 text-white/60">{shot.direction}</p>{shot.spokenLine&&<p className="mt-1 italic">{shot.spokenLine}</p>}</div>)}</div></div>}
        {!!selectedPost.slides.length&&<div className="rounded-2xl border border-white/10 p-5"><h3 className="font-black">Slides / frames</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{selectedPost.slides.map((slide,i)=>
          <div key={i} className="rounded-xl bg-white/[0.03] p-3 text-sm"><strong>{i+1}. {slide.headline}</strong><p className="mt-2">{slide.copy}</p><p className="mt-2 text-white/45">{slide.visual}</p></div>)}</div></div>}
      </div>}
    </section>}
    {tab==="growth"&&<section className="space-y-4">
      <div><h2 className="text-xl font-black">First 1,000 · real followers</h2><p className="mt-1 text-sm text-white/55">24h and 72h measurements, not invented forecasts. Weekly audience readout refreshes from connected or manually entered account metrics.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{growth?.platforms.map(p=>
        <div key={p.platform} className="rounded-2xl border border-white/10 p-5"><div className="text-xs uppercase tracking-widest text-white/50">{p.platform}</div>
          <div className="mt-2 text-3xl font-black">{p.followers??"—"}<span className="text-sm text-white/40"> / 1000</span></div>
          <p className="mt-2 text-xs text-white/50">{p.weeklyChange!=null?`${p.weeklyChange>=0?"+":""}${p.weeklyChange} this week`:"Weekly change unavailable"}</p></div>)}</div>
      <div className="rounded-2xl border border-white/10 p-5"><h3 className="font-bold">Audience update</h3>
        <p className="mt-2 text-sm text-white/60">{growth?.weeklyAudienceNote||"Loading connected audience snapshots…"}</p>
        <p className="mt-2 text-xs text-white/45">Only actual available provider analytics; no estimated age, location, interests or follower identities.</p>
      </div>
      {!!growth?.audienceSignals?.length&&<div className="rounded-2xl border border-white/10 p-5">
        <h3 className="font-black">What your followers talk about · last 7 days</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{growth.audienceSignals.map((item,i)=><div key={`${item.topic}:${i}`} className="rounded-xl bg-white/[0.03] p-3 text-sm">
          <strong>{item.topic}</strong><p className="mt-1 text-white/60">{item.summary}</p>
          <p className="mt-2 text-xs text-white/45">{item.occurrences} signals · {item.platforms.join(", ")}</p>
          <p className="mt-1 text-xs text-lime-300">Next story: {item.recommendedContentAngle}</p>
        </div>)}</div>
      </div>}
      <h3 className="text-lg font-black">Studio series performance · verified 48h / 96h</h3>
      <p className="text-xs text-white/50">A missing provider snapshot is awaiting metrics, not zero views. Reports are based only on published Studio-linked records.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{releaseAnalytics?.series.map(s=><div key={s.seriesKey} className="rounded-xl border border-white/10 p-4 text-sm">
        <strong>{s.seriesKey}</strong><p className="mt-1 text-white/60">{s.published} published · {s.measured48} with 48h data · {s.measured96} with 96h data</p>
        <p className="mt-1">Views at 96h: {s.measured96?s.views96.toLocaleString():"Awaiting snapshots"}</p>
        <p className="mt-1 text-xs text-white/45">Shares {s.shares96} · Saves {s.saves96} (measured posts only)</p>
      </div>)}</div>
      <div className="grid gap-2">{releaseAnalytics?.posts.map(p=><div key={p.publicationId} className="rounded-xl border border-white/10 p-4 text-sm">
        <strong>{cap(p.platform)} · {p.seriesKey}</strong><span className="ml-3 text-white/45">{p.ageHours} hours live</span>
        <p className="mt-1 text-white/60">48h: {cap(p.review48.status)} · 96h: {cap(p.review96.status)}</p>
        {p.review96.status==="available"&&<p className="mt-1">96h: {p.review96.views} views · {p.review96.shares} shares · {p.review96.saves} saves</p>}
      </div>)}</div>
      <h3 className="text-lg font-black">Legacy post performance · 24h / 72h</h3>
      <div className="grid gap-2">{growth?.publications.length?growth.publications.map(p=>
        <div key={p.publicationId} className="rounded-xl border border-white/10 p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2"><span className="font-bold">{cap(p.platform)}</span><span className="text-xs text-white/50">{p.ageHours}h since publication</span></div>
          <p className="mt-2 text-white/60">24h: {cap(p.review24.status)} · 72h: {cap(p.review72.status)}</p>
          {p.review24.metrics&&<p className="mt-2 text-xs">24h · {JSON.stringify(p.review24.metrics)}</p>}
          {p.review72.metrics&&<p className="mt-2 text-xs">72h · {JSON.stringify(p.review72.metrics)}</p>}
        </div>):<div className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-white/50">No measured publications this week. Connect analytics or add a manual snapshot after publishing.</div>}</div>
      <button type="button" disabled={!!busy} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold"
        onClick={()=>run("growth",async()=>setGrowth(await studioRequest<StudioGrowth>("studio/growth")))}>Refresh real metrics</button>
    </section>}
  </main>;
}
function CopyPanel({title,value}:{title:string;value:string}){
  return <div className="rounded-2xl border border-white/10 p-4">
    <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{title}</h3>
      {!!value&&<button type="button" onClick={()=>void navigator.clipboard.writeText(value)}
        className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/60">Copy</button>}</div>
    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/75">{value||"Not yet written."}</p>
  </div>;
}
