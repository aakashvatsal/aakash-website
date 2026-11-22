"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Loader2,
  MessageSquareText,
  PlugZap,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  XCircle,
  Copy,
} from "lucide-react";

type Workspace = {
  teamId: string;
  teamName: string;
  fraytoCompanyId?: string | null;
  connected: boolean;
  enabled: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  restrictChannelUsers: boolean;
  monitorChannels: boolean;
  allowDMs: boolean;
  allowedChannelIds: string[];
  allowedUserIds: string[];
};
type SlackStatus = {
  configured: boolean;
  installUrl: string | null;
  workspaces: Workspace[];
};
type QueryItem = {
  _id: string;
  teamId: string;
  channelId: string;
  userId: string;
  query: string;
  intent?: string;
  underlyingNeed?: string;
  urgency?: string;
  status: string;
  answer?: string;
  createdAt: string;
};
type Knowledge = { _id: string; title: string; content: string };

const api = "/api/admin/backend/integrations/slack";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${api}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : message || "Unable to update Slack integration.",
    );
  }
  return result as T;
}

function TextLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest text-white/45">
      {children}
    </label>
  );
}

function WorkspaceEditor({
  workspace,
  onUpdated,
  onError,
}: {
  workspace: Workspace;
  onUpdated: () => Promise<void>;
  onError: (error: string) => void;
}) {
  const [enabled, setEnabled] = useState(workspace.enabled);
  const [approvalStatus, setApprovalStatus] = useState(
    workspace.approvalStatus,
  );
  const [restrictChannelUsers, setRestrictChannelUsers] = useState(
    workspace.restrictChannelUsers,
  );
  const [allowDMs, setAllowDMs] = useState(workspace.allowDMs);
  const [monitorChannels, setMonitorChannels] = useState(workspace.monitorChannels ?? false);
  const [channels, setChannels] = useState(
    workspace.allowedChannelIds.join(", "),
  );
  const [users, setUsers] = useState(workspace.allowedUserIds.join(", "));
  const [busy, setBusy] = useState(false);
  const csv = (value: string) =>
    value
      .split(/[\s,]+/)
      .map((part) => part.trim())
      .filter(Boolean);

  const save = async () => {
    setBusy(true);
    onError("");
    try {
      await request(`/workspaces/${encodeURIComponent(workspace.teamId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          approvalStatus,
          enabled,
          allowDMs,
          restrictChannelUsers,
          monitorChannels,
          allowedChannelIds: csv(channels),
          allowedUserIds: csv(users),
        }),
      });
      await onUpdated();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Unable to update workspace.",
      );
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm(`Disconnect HSAKAA from ${workspace.teamName}?`))
      return;
    setBusy(true);
    try {
      await request(`/workspaces/${encodeURIComponent(workspace.teamId)}`, {
        method: "DELETE",
      });
      await onUpdated();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to disconnect workspace.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-white">{workspace.teamName}</p>
          <p className="text-xs text-white/40">
            Workspace ID: {workspace.teamId}
          </p>
          <p className="mt-1 text-xs text-white/45">
            Frayto operations: {workspace.fraytoCompanyId ? "Workspace mapped (Frayto API connection still requires verification)" : "Not configured"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 text-xs font-semibold ${approvalStatus === "approved" ? "text-[#C6FF32]" : approvalStatus === "rejected" ? "text-red-300" : "text-amber-200"}`}
        >
          {approvalStatus === "approved" ? (
            <CheckCircle2 size={15} />
          ) : (
            <ShieldCheck size={15} />
          )}
          {approvalStatus === "approved"
            ? "Approved"
            : approvalStatus === "rejected"
              ? "Rejected"
              : "Awaiting approval"}
        </span>
      </div>
      <div className="space-y-2">
        <TextLabel>Owner authorization decision</TextLabel>
        <select
          aria-label={`Approval status for ${workspace.teamName}`}
          value={approvalStatus}
          onChange={(event) => {
            const next = event.target.value as Workspace["approvalStatus"];
            setApprovalStatus(next);
            if (next !== "approved") setEnabled(false);
          }}
          className="w-full rounded-xl border border-white/10 bg-[#151515] p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
        >
          <option value="pending">Pending — no AI access</option>
          <option value="approved">Approved — eligible for access</option>
          <option value="rejected">Rejected — no AI access</option>
        </select>
        <p className="text-xs text-white/40">
          Installing the Slack app never grants access. Only you can approve a
          workspace here.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <TextLabel>Allowed channels (Slack IDs)</TextLabel>
          <input
            aria-label="Allowed Slack channel IDs"
            value={channels}
            onChange={(e) => setChannels(e.target.value)}
            placeholder="C01234567, G01234567"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          />
          <p className="text-xs text-white/35">
            @HSAKAA mentions are processed. Optional channel monitoring also handles ordinary requests in listed channels once Slack history permissions are granted.
          </p>
        </div>
        <div className="space-y-2">
          <TextLabel>Allowed members (Slack IDs)</TextLabel>
          <input
            aria-label="Allowed Slack member IDs"
            value={users}
            onChange={(e) => setUsers(e.target.value)}
            placeholder="U01234567, U02345678"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          />
          <p className="text-xs text-white/35">
            Members allowed to DM HSAKAA; optionally restrict channel mentions
            to this same list.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={allowDMs}
            onChange={(e) => setAllowDMs(e.target.checked)}
            className="accent-[#C6FF32]"
          />{" "}
          Allow DMs from listed members
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={restrictChannelUsers}
            onChange={(e) => setRestrictChannelUsers(e.target.checked)}
            className="accent-[#C6FF32]"
          />{" "}
          Require approved members in channels
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={monitorChannels}
            onChange={(e) => setMonitorChannels(e.target.checked)}
            className="accent-[#C6FF32]"
          />{" "}
          Monitor regular messages in allowed channels (requires Slack history scopes)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={enabled}
            disabled={approvalStatus !== "approved"}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-[#C6FF32]"
          />{" "}
          Enable AI responses
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={busy}
          onClick={save}
          className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save access settings"}
        </button>
        <button
          disabled={busy}
          onClick={disconnect}
          className="rounded-xl border border-red-400/20 px-4 py-2.5 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function SlackIntegration() {
  const [status, setStatus] = useState<SlackStatus | null>(null);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [knowledgeTeamId, setKnowledgeTeamId] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(async () => {
    const [nextStatus, nextQueries] = await Promise.all([
      request<SlackStatus>("/status"),
      request<{ items: QueryItem[] }>("/queries?limit=100"),
    ]);
    setStatus(nextStatus);
    setQueries(nextQueries.items);
    setKnowledgeTeamId((current) =>
      nextStatus.workspaces.some(
        (team) => team.connected && team.teamId === current,
      )
        ? current
        : (nextStatus.workspaces.find((team) => team.connected)?.teamId ?? ""),
    );
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    refresh()
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Unable to load Slack data.",
        ),
      )
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!knowledgeTeamId) return;
    let current = true;
    request<Knowledge[]>(
      `/knowledge?teamId=${encodeURIComponent(knowledgeTeamId)}`,
    )
      .then((items) => {
        if (current) setKnowledge(items);
      })
      .catch((err: unknown) => {
        if (current)
          setError(
            err instanceof Error ? err.message : "Unable to load knowledge.",
          );
      });
    return () => {
      current = false;
    };
  }, [knowledgeTeamId, refreshCount]);

  const connect = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await request<{ authorizationUrl: string }>("/connect");
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Slack could not be connected.",
      );
      setBusy(false);
    }
  };

  const addKnowledge = async () => {
    setBusy(true);
    setError("");
    try {
      if (!knowledgeTeamId)
        throw new Error("Select a connected workspace first.");
      await request("/knowledge", {
        method: "POST",
        body: JSON.stringify({ teamId: knowledgeTeamId, title, content }),
      });
      setTitle("");
      setContent("");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Knowledge could not be added.",
      );
    } finally {
      setBusy(false);
    }
  };

  const removeKnowledge = async (id: string) => {
    setBusy(true);
    try {
      await request(
        `/knowledge/${encodeURIComponent(id)}?teamId=${encodeURIComponent(knowledgeTeamId)}`,
        { method: "DELETE" },
      );
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove knowledge.",
      );
    } finally {
      setBusy(false);
    }
  };

  const connected = status?.workspaces.filter((item) => item.connected) ?? [];
  const visibleQueries = queries.filter(
    (item) => !knowledgeTeamId || item.teamId === knowledgeTeamId,
  );
  return (
    <section className="space-y-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
            <MessageSquareText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black">HSAKAA × Slack</h2>
            <p className="mt-1 text-sm text-white/45">
              Understand intent, answer queries and track outcomes in Slack
              threads.
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            refresh().catch((err: unknown) => setError(String(err)))
          }
          aria-label="Refresh Slack integration"
          className="rounded-xl border border-white/10 p-2.5 text-white/70 hover:bg-white/5"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <CircleAlert size={16} />
          {error}
        </div>
      )}
      {loading && (
        <p className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 size={16} className="animate-spin" />
          Loading Slack integration…
        </p>
      )}
      {!loading && status && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              {connected.length ? (
                <CheckCircle2 size={16} className="text-[#C6FF32]" />
              ) : (
                <XCircle size={16} className="text-white/35" />
              )}
              {connected.length
                ? `${connected.length} connected workspace${connected.length > 1 ? "s" : ""}`
                : status.configured
                  ? "Ready to connect"
                  : "Backend Slack credentials required"}
            </div>
            <button
              disabled={busy || !status.configured}
              onClick={connect}
              className="flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              <PlugZap size={16} /> Connect workspace
            </button>
          </div>
          {status.installUrl && (
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-bold text-white">
                Share HSAKAA with other Slack workspaces
              </div>
              <p className="text-xs leading-relaxed text-white/50">
                After enabling Slack app distribution, share this public
                installation URL. New installations remain pending until you
                approve them. No access to AI or workspace knowledge is granted
                during installation.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  aria-label="Public Slack installation URL"
                  value={status.installUrl}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/70"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(status.installUrl!)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 p-3 text-xs font-semibold hover:bg-white/5"
                >
                  <Copy size={14} /> Copy link
                </button>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 rounded-xl border border-white/10 p-3 text-sm leading-relaxed text-white/50">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#C6FF32]" />
            Every new installation requires explicit workspace approval. Only
            authorized users and channels can use AI; private-owner HSAKAA
            memory and tools are unavailable in Slack. Unauthorized requests
            receive an access-denied reply.
          </div>
          {connected.map((workspace) => (
            <WorkspaceEditor
              key={workspace.teamId}
              workspace={workspace}
              onUpdated={refresh}
              onError={setError}
            />
          ))}
        </>
      )}
      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <BrainCircuit size={19} className="text-[#C6FF32]" />
          <h3 className="font-bold">Approved Slack knowledge</h3>
        </div>
        <p className="text-sm text-white/45">
          Knowledge is isolated by Slack workspace. Select the workspace before
          adding or reviewing its information.
        </p>
        <select
          aria-label="Knowledge and query workspace"
          value={knowledgeTeamId}
          onChange={(event) => {
            setKnowledgeTeamId(event.target.value);
            setKnowledge([]);
          }}
          className="w-full rounded-xl border border-white/10 bg-[#151515] p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
        >
          {connected.length === 0 && (
            <option value="">No connected workspace</option>
          )}
          {connected.map((team) => (
            <option key={team.teamId} value={team.teamId}>
              {team.teamName} · {team.teamId}
            </option>
          ))}
        </select>
        <div className="grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Knowledge title (e.g. API onboarding)"
            aria-label="Knowledge title"
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={15000}
            rows={4}
            placeholder="Approved instructions, FAQs, policies, or support details..."
            aria-label="Approved Slack knowledge"
            className="resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          />
          <div>
            <button
              disabled={
                busy ||
                connected.length === 0 ||
                !title.trim() ||
                !content.trim()
              }
              onClick={addKnowledge}
              className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-40"
            >
              <Plus size={15} /> Add knowledge
            </button>
          </div>
        </div>
        {knowledge.length ? (
          <div className="grid gap-2">
            {knowledge.map((entry) => (
              <div
                key={entry._id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-white/45">
                    {entry.content}
                  </p>
                </div>
                <button
                  aria-label={`Delete ${entry.title}`}
                  onClick={() => removeKnowledge(entry._id)}
                  disabled={busy}
                  className="shrink-0 p-1 text-white/40 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/35">
            No approved knowledge added yet.
          </p>
        )}
      </div>
      <div className="space-y-3 border-t border-white/10 pt-6">
        <h3 className="font-bold">Recent Slack queries</h3>
        {visibleQueries.length === 0 ? (
          <p className="text-sm text-white/40">
            No queries received for the selected workspace.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleQueries.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-white/45">
                  <span>{item.status.replaceAll("_", " ")}</span>
                  <span>•</span>
                  <span>{item.urgency ?? "Unclassified"}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {item.query}
                </p>
                {item.intent && (
                  <p className="mt-2 text-sm text-white/65">
                    <span className="font-semibold text-[#C6FF32]">
                      Intent:
                    </span>{" "}
                    {item.intent}
                  </p>
                )}
                {item.underlyingNeed && (
                  <p className="mt-1 text-sm text-white/65">
                    <span className="font-semibold">What they need:</span>{" "}
                    {item.underlyingNeed}
                  </p>
                )}
                {item.answer && (
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-white/45">
                    {item.answer}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
