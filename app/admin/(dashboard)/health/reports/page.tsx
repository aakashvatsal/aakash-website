import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { HealthReportsManager } from "@/components/admin/health-os/HealthReportsManager";
import { getHealthReports } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

function dateInIndia(offsetDays=0){const d=new Date(Date.now()+offsetDays*86400000);return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);}

export default async function HealthReportsPage(){
  try{const reports=await getHealthReports();return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Health Reports" description="Turn tracked health, diet and supplement data into periodic reviews and action items."/><HealthOsNav/><HealthReportsManager initialReports={reports} defaultStart={dateInIndia(-6)} defaultEnd={dateInIndia(0)}/></main>;}
  catch(error){return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Health Reports" description="Periodic health review."/><HealthOsNav/><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error?error.message:"Unable to load Health Reports."}</div></main>;}
}
