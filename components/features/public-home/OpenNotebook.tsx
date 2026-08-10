"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export function OpenNotebook() {
  const notes = [
    ["Today I realized", "Distribution is harder than product."],
    ["Built", "Improved 8lete onboarding flow."],
    ["Read", "The Pragmatic Programmer — 21 pages."],
    ["Trained", "Push day + 7,248 steps."],
  ];

  return (
    <Reveal>
      <section className="border-t border-white/10 px-6 py-28 md:px-12 lg:px-16">
        <p className="mb-8 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
          Open Notebook
        </p>

        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl">
            Raw notes from building, reading, training and learning.
          </h2>

          <SpotlightCard className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.035]">
            <div className="p-8">
              {notes.map(([title, body]) => (
                <motion.div
                  key={title}
                  whileHover={{
                    x: 8,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  className="border-b border-white/10 py-6 first:pt-0 last:border-0 last:pb-0"
                >
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C6FF32]">
                    {title}
                  </p>

                  <p className="mt-3 text-2xl font-black text-white">
                    {body}
                  </p>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </section>
    </Reveal>
  );
}