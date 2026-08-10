import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Globe2,
  UserRound,
} from "lucide-react";

import type { Memory } from "@/types/hsakaa";

type HsakaaRecentMemoriesProps = {
  memories: Memory[];
};

function formatEnum(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getPersonName(memory: Memory) {
  if (
    memory.personId &&
    typeof memory.personId === "object"
  ) {
    return (
      memory.personId.preferredName ??
      memory.personId.name
    );
  }

  return null;
}

export function HsakaaRecentMemories({
  memories,
}: HsakaaRecentMemoriesProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
            Knowledge
          </p>

          <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
            Recent memories
          </h2>
        </div>

        <Link
          href="/admin/hsakaa/memory"
          className="flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#C6FF32]"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
            <Brain className="h-5 w-5" />
          </div>

          <h3 className="mt-4 font-bold text-white">
            No memories stored
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
            Add the first memory HSAKAA should
            use while representing you.
          </p>

          <Link
            href="/admin/hsakaa/memory/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            Add first memory
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {memories.map((memory) => {
            const personName =
              getPersonName(memory);

            const ScopeIcon = personName
              ? UserRound
              : Globe2;

            return (
              <Link
                key={memory._id}
                href={`/admin/hsakaa/memory/${memory._id}`}
                className="block p-5 transition hover:bg-white/[0.025]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/45">
                    <ScopeIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold leading-6 text-white">
                      {memory.content}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                        {formatEnum(memory.type)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                        {formatEnum(memory.source)}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          personName
                            ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                            : "border-white/10 bg-white/[0.04] text-white/45"
                        }`}
                      >
                        {personName ?? "Global"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}