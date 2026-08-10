"use client";

import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { GlassCard } from "@/components/ui/GlassCard";

export function BrainDump() {
  return (
    <section className="border-t border-white/10 px-6 py-28 md:px-12 lg:px-16">
      <SpotlightCard className="overflow-hidden rounded-[48px] border border-white/10 bg-[#070b0d]">
        <div className="p-8 md:p-14">
          <p className="mb-8 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
            Thinking...
          </p>

          <h2 className="max-w-5xl text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl">
            What makes people adopt software?
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "Pain must be frequent.",
              "The new habit must feel easier than the old habit.",
              "The buyer and user need different stories.",
            ].map((thought) => (
              <motion.div
                key={thought}
                whileHover={{
                  scale: 1.04,
                  y: -6,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                <GlassCard className="h-full rounded-[28px] p-6">
                  <p className="text-xl font-black leading-8">{thought}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-sm text-white/35">
            Updated 17 minutes ago
          </p>
        </div>
      </SpotlightCard>
    </section>
  );
}