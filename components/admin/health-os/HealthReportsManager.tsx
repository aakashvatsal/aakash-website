"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileHeart, Plus, Trash2 } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  deleteHealthReport,
  generateHealthReport,
  updateHealthReportRecommendation,
} from "@/lib/api/health-extended";
import type { HealthReport, HealthReportType } from "@/types/health-extended";

type Props = { initialReports: HealthReport[]; defaultStart: string; defaultEnd: string };
const inputClass = "min-h-11 rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none focus:border-[#C6FF32]/50";
const reportTypes: HealthReportType[] = ["weekly","fortnightly","monthly","quarterly","custom"];
function label(v:string){return v.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());}

export function HealthReportsManager({ initialReports, defaultStart, defaultEnd }: Props) {
  const [reports,setReports]=useState(initialReports);
  const [reportType,setReportType]=useState<HealthReportType>("weekly");
  const [periodStart,setPeriodStart]=useState(defaultStart);
  const [periodEnd,setPeriodEnd]=useState(defaultEnd);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const openRecommendations=useMemo(()=>reports.reduce((sum,r)=>sum+(r.recommendations?.filter(x=>!x.completed).length??0),0),[reports]);
  const latest=reports[0];

  async function generate(){setBusy(true);setError(null);try{const report=await generateHealthReport({reportType,periodStart,periodEnd});setReports(c=>[report,...c.filter(r=>r._id!==report._id)]);}catch(err){setError(err instanceof Error?err.message:"Unable to generate report.");}finally{setBusy(false);}}
  async function toggleRecommendation(reportId:string,index:number,completed:boolean){setBusy(true);setError(null);try{const report=await updateHealthReportRecommendation(reportId,index,completed);setReports(c=>c.map(r=>r._id===reportId?report:r));}catch(err){setError(err instanceof Error?err.message:"Unable to update recommendation.");}finally{setBusy(false);}}
  async function remove(reportId:string){if(!window.confirm("Delete this health report?"))return;setBusy(true);setError(null);try{await deleteHealthReport(reportId);setReports(c=>c.filter(r=>r._id!==reportId));}catch(err){setError(err instanceof Error?err.message:"Unable to delete report.");}finally{setBusy(false);}}

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <AdminStatCard label="Reports" value={reports.length} description="Generated health reviews." icon={FileHeart}/>
      <AdminStatCard label="Open actions" value={openRecommendations} description="Recommendations not completed." icon={CheckCircle2}/>
      <AdminStatCard label="Latest score" value={latest?.overallHealthScore!=null?Math.round(latest.overallHealthScore):"—"} description={latest?`${label(latest.reportType)} · ${label(latest.overallTrend)}`:"No report yet."} icon={FileHeart}/>
    </div>
    {error?<div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>:null}
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div><h2 className="text-lg font-black">Generate report</h2><p className="mt-1 text-sm text-white/40">Create a health review from tracked health, diet and supplement data.</p></div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <select className={inputClass} value={reportType} onChange={e=>setReportType(e.target.value as HealthReportType)}>{reportTypes.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
        <input className={inputClass} type="date" value={periodStart} onChange={e=>setPeriodStart(e.target.value)}/>
        <input className={inputClass} type="date" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)}/>
        <button disabled={busy||!periodStart||!periodEnd} onClick={generate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50"><Plus className="h-4 w-4"/>Generate</button>
      </div>
    </section>
    <div className="space-y-4">
      {reports.map(report=><article key={report._id} className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">{label(report.reportType)} · {report.periodStart.slice(0,10)} → {report.periodEnd.slice(0,10)}</p><h2 className="mt-2 text-xl font-black">{report.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{report.executiveSummary??"No executive summary."}</p></div><div className="flex items-center gap-3"><div className="rounded-2xl border border-white/10 px-4 py-3 text-center"><p className="text-xs uppercase tracking-[0.14em] text-white/30">Score</p><p className="mt-1 text-2xl font-black">{report.overallHealthScore!=null?Math.round(report.overallHealthScore):"—"}</p></div><button onClick={()=>remove(report._id)} disabled={busy} className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/20 text-red-300"><Trash2 className="h-4 w-4"/></button></div></div>
        {report.sections?.length?<div className="mt-5 grid gap-3 md:grid-cols-2">{report.sections.map((section,index)=><div key={`${section.category}-${index}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="font-black">{section.category}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/30">{label(section.trend)}</p>{section.summary?<p className="mt-3 text-sm leading-6 text-white/45">{section.summary}</p>:null}</div>)}</div>:null}
        {report.recommendations?.length?<div className="mt-5"><p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/30">Recommendations</p><div className="space-y-2">{report.recommendations.map((rec,index)=><label key={`${rec.title}-${index}`} className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-white/10 bg-black/20 p-4"><input type="checkbox" className="mt-1" checked={rec.completed} disabled={busy} onChange={e=>toggleRecommendation(report._id,index,e.target.checked)}/><span><span className="font-bold text-white">{rec.title}</span><span className="ml-2 text-xs uppercase tracking-[0.12em] text-white/30">{label(rec.priority)}</span><span className="mt-1 block text-sm text-white/45">{rec.recommendation}</span></span></label>)}</div></div>:null}
      </article>)}
      {!reports.length?<div className="rounded-[24px] border border-dashed border-white/10 p-8 text-center text-sm text-white/35">No health reports generated yet.</div>:null}
    </div>
  </div>;
}
