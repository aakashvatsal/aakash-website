import { Activity, CheckCircle2, Link2, Radio, XCircle } from "lucide-react";
import type { IntegrationsOverview, IntegrationProviderStatus } from "@/types/health-extended";

type Props = { overview: IntegrationsOverview };

function boolStatus(value: unknown) {
  return value === true;
}

function providerConfigured(value: IntegrationProviderStatus | boolean | string | undefined) {
  if (typeof value === "boolean") return value;
  if (!value || typeof value !== "object") return false;
  return boolStatus(value.configured) || boolStatus(value.connected) || boolStatus(value.enabled);
}

function providerMode(value: IntegrationProviderStatus | boolean | string | undefined) {
  if (!value || typeof value !== "object") return undefined;
  const mode = value.mode;
  return typeof mode === "string" ? mode : undefined;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function IntegrationsStatus({ overview }: Props) {
  const whoop = overview.health?.whoop ?? {};
  const whoopConnected = typeof whoop === "object" && whoop !== null && "connected" in whoop
    ? Boolean((whoop as Record<string, unknown>).connected)
    : false;
  const providers = Object.entries(overview.mediaAnalytics ?? {});

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"><Activity className="h-5 w-5" /></div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-lg font-black">WHOOP</h2><p className="mt-1 text-sm text-white/40">Health sync integration.</p></div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${whoopConnected ? "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]" : "border-white/10 bg-white/[0.03] text-white/40"}`}>
                {whoopConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {whoopConnected ? "Connected" : "Not connected"}
              </span>
            </div>
            {typeof whoop === "object" && whoop !== null ? (
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(whoop as Record<string, unknown>)
                  .filter(([key, value]) => !["provider", "connected"].includes(key) && value !== undefined && value !== null && value !== "")
                  .slice(0, 9)
                  .map(([key, value]) => (
                    <div key={key} className="rounded-[14px] border border-white/10 bg-black/20 p-3"><p className="text-xs uppercase tracking-[0.14em] text-white/30">{label(key)}</p><p className="mt-1 break-words text-white/65">{Array.isArray(value) ? value.join(", ") : String(value)}</p></div>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
        <div className="flex items-center gap-3"><Radio className="h-5 w-5 text-[#C6FF32]" /><div><h2 className="text-lg font-black">Media analytics providers</h2><p className="mt-1 text-sm text-white/40">Provider credentials are configured through backend environment variables.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map(([name, value]) => {
            const configured = providerConfigured(value);
            const mode = providerMode(value);
            return <article key={name} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-black">{label(name)}</p>{configured ? <CheckCircle2 className="h-4 w-4 text-[#C6FF32]" /> : <XCircle className="h-4 w-4 text-white/25" />}</div>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/30">{configured ? "Configured" : "Not configured"}</p>
              {mode ? <p className="mt-2 text-sm text-white/45">{label(mode)}</p> : null}
            </article>;
          })}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-white/40"><Link2 className="mt-0.5 h-4 w-4 shrink-0" /><p>API tokens remain server-side in <code className="text-white/60">.env</code>; this page reports whether each provider is configured without exposing secrets.</p></div>
      </section>
    </div>
  );
}
